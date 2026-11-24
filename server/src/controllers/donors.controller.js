import { DonorProfile } from "../models/index.js";
import { BLOOD_GROUPS, DONOR_COOLDOWN_DAYS } from "../constants/index.js";
import { AppError, asyncHandler, send, pick } from "../utils/http.js";
import {
    audit,
    validateLocation,
    isInCooldown,
    donorCooldownCutoff,
    effectiveAvailability,
} from "./helpers.js";

export const putDonorsMe = asyncHandler(async (req, res) => {
  const allowed = pick(req.body, [
    "bloodGroup",
    "lastDonationDate",
    "availability",
    "division",
    "district",
    "upazila",
    "union",
    "area",
    "lat",
    "lng",
    "isPubliclyListed",
    "allowContactRequests",
  ]);
  if (!BLOOD_GROUPS.includes(allowed.bloodGroup))
    throw new AppError("Valid blood group is required.", 400);
  const hasLat = allowed.lat !== undefined && allowed.lat !== null;
  const hasLng = allowed.lng !== undefined && allowed.lng !== null;
  if (hasLat !== hasLng)
    throw new AppError("Provide both latitude and longitude.", 400);
  if (hasLat && (Math.abs(allowed.lat) > 90 || Math.abs(allowed.lng) > 180))
    throw new AppError("Invalid map coordinates.", 400);
  await validateLocation(allowed);

  const current = await DonorProfile.findOne({ user: req.user._id })
    .select("lastDonationDate availability")
    .lean();
  const nextLastDonationDate =
    allowed.lastDonationDate !== undefined
      ? allowed.lastDonationDate
      : current?.lastDonationDate;
  const resting = isInCooldown(nextLastDonationDate);
  if (resting && allowed.availability === "available")
    throw new AppError(
      `You can be marked available again ${DONOR_COOLDOWN_DAYS} days after your last donation.`,
      409
    );
  // Never leave a recent donor marked available, even if they didn't touch that field.
  if (resting) allowed.availability = "unavailable";

  if (allowed.isPubliclyListed && !allowed.allowContactRequests)
    throw new AppError("Public listing requires contact-request consent.", 400);
  const profile = await DonorProfile.findOneAndUpdate(
    { user: req.user._id },
    { ...allowed, consentUpdatedAt: new Date() },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await audit(req, "donor.profile_updated", "DonorProfile", profile._id);
  send(res, { profile });
});

export const getDonorsMe = asyncHandler(async (req, res) => {
  const profile = await DonorProfile.findOne({ user: req.user._id }).populate(
    "division district upazila union",
    "nameEn nameBn type",
  );
  send(res, { profile });
});

/* Staff-facing full list (includes non-public and unavailable profiles). */
export const getDonorsAdmin = asyncHandler(async (req, res) => {
  const items = await DonorProfile.find()
    .populate("user", "fullName phone")
    .populate("division district upazila union", "nameEn nameBn")
    .sort({ createdAt: -1 });
  send(res, { items });
});

export const getDonorById = asyncHandler(async (req, res) => {
  const item = await DonorProfile.findById(req.params.id)
    .populate("user", "fullName phone")
    .populate("division district upazila union", "nameEn nameBn");
  if (!item) throw new AppError("Donor profile not found.", 404);
  send(res, { item });
});

export const getDonorsSearch = asyncHandler(async (req, res) => {
  const filter = {
    isPubliclyListed: true,
    allowContactRequests: true,
    availability: "available",
    // Donors inside the post-donation rest period are never shown as available.
    $or: [{ lastDonationDate: null }, { lastDonationDate: { $lte: donorCooldownCutoff() } }],
  };
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.district) filter.district = req.query.district;
  if (req.query.upazila) filter.upazila = req.query.upazila;
  if (req.query.union) filter.union = req.query.union;
  if (req.query.division) filter.division = req.query.division;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    DonorProfile.find(filter)
      .select("bloodGroup availability division district upazila union area lat lng lastDonationDate user")
      .populate("division district upazila union", "nameEn nameBn")
      .populate("user", "fullName phoneVerified")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DonorProfile.countDocuments(filter),
  ]);
  // Never expose phone/address; the UI only needs a display name and verification state.
  const publicItems = items.map(({ user, ...donor }) => ({
    ...donor,
    availability: effectiveAvailability(donor),
    fullName: user?.fullName || "Donor",
    isVerified: Boolean(user?.phoneVerified),
  }));
  send(res, { items: publicItems, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
