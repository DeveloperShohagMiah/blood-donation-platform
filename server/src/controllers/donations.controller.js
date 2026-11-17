import { DonorProfile, BloodRequest, DonationRecord } from "../models/index.js";
import { REQUEST_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit } from "./helpers.js";

export const postDonations = asyncHandler(async (req, res) => {
  const { request: requestId, donor: donorId, donatedAt, units = 1, notes = "" } = req.body;
  const [request, donor] = await Promise.all([
    BloodRequest.findById(requestId),
    DonorProfile.findById(donorId),
  ]);
  if (!request || !donor) throw new AppError("Request or donor not found.", 404);
  if (request.status === REQUEST_STATUS.REJECTED || request.status === REQUEST_STATUS.CANCELLED)
    throw new AppError("Cannot record a donation for this request.", 409);
  const record = await DonationRecord.create({
    request: request._id,
    donor: donor._id,
    confirmedBy: req.user._id,
    donatedAt,
    units,
    notes,
  });
  const total = await DonationRecord.aggregate([
    { $match: { request: request._id, status: "confirmed" } },
    { $group: { _id: null, units: { $sum: "$units" } } },
  ]);
  request.unitsFulfilled = total[0]?.units || 0;
  request.status =
    request.unitsFulfilled >= request.units ? REQUEST_STATUS.FULFILLED : REQUEST_STATUS.IN_PROGRESS;
  await request.save();
  donor.lastDonationDate = new Date(donatedAt);
  await donor.save();
  await audit(req, "donation.confirmed", "DonationRecord", record._id, { units });
  send(res, { record, request }, 201);
});

/* Donor-scoped history; the generic /donations feed is staff-only. */
export const getMyDonations = asyncHandler(async (req, res) => {
  const profile = await DonorProfile.findOne({ user: req.user._id });
  if (!profile) return send(res, { items: [] });

  const items = await DonationRecord.find({
    donor: profile._id,
    status: "confirmed",
  })
    .populate("request", "patientName bloodGroup hospitalName")
    .populate("confirmedBy", "fullName")
    .sort({ donatedAt: -1 });
  send(res, { items });
});

export const getDonations = asyncHandler(async (req, res) => {
  const filter = { status: "confirmed" };
  if (req.query.request) filter.request = req.query.request;
  const items = await DonationRecord.find(filter)
    .populate("donor", "bloodGroup")
    .populate("request", "patientName bloodGroup")
    .populate("confirmedBy", "fullName")
    .sort({ donatedAt: -1 });
  send(res, { items });
});
