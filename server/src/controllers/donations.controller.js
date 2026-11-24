import { DonorProfile, BloodRequest, DonationRecord, Notification } from "../models/index.js";
import { REQUEST_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit } from "./helpers.js";

const confirmedUnits = async (requestId, excludeId = null) => {
  const match = { request: requestId, status: "confirmed" };
  if (excludeId) match._id = { $ne: excludeId };
  const result = await DonationRecord.aggregate([
    { $match: match },
    { $group: { _id: null, units: { $sum: "$units" } } },
  ]);
  return result[0]?.units || 0;
};

/* Recalculate a request's fulfilled units after any donation change. */
const recalculateRequest = async (requestId) => {
  const request = await BloodRequest.findById(requestId);
  if (!request) return null;

  request.unitsFulfilled = await confirmedUnits(request._id);
  const terminal = [
    REQUEST_STATUS.CANCELLED,
    REQUEST_STATUS.REJECTED,
    REQUEST_STATUS.EXPIRED,
  ];
  if (!terminal.includes(request.status)) {
    if (request.unitsFulfilled >= request.units) {
      request.status = REQUEST_STATUS.FULFILLED;
    } else if (request.unitsFulfilled > 0) {
      request.status = REQUEST_STATUS.IN_PROGRESS;
    } else if ([REQUEST_STATUS.IN_PROGRESS, REQUEST_STATUS.FULFILLED].includes(request.status)) {
      request.status = REQUEST_STATUS.MATCHING;
    }
  }
  await request.save();
  return request;
};

/* Keep the donor's lastDonationDate in sync with their confirmed records. */
const recalculateDonor = async (donorId) => {
  const result = await DonationRecord.aggregate([
    { $match: { donor: donorId, status: "confirmed" } },
    { $group: { _id: null, lastDonationDate: { $max: "$donatedAt" } } },
  ]);
  await DonorProfile.updateOne(
    { _id: donorId },
    { $set: { lastDonationDate: result[0]?.lastDonationDate || null } }
  );
};

const notifyRequester = async (request, units) =>
  Notification.create({
    recipient: request.requester,
    title: "Blood donation recorded",
    message: `${units} ${units === 1 ? "unit has" : "units have"} been recorded for ${request.patientName}. ${request.unitsFulfilled} of ${request.units} units are now fulfilled.`,
    type: "donation",
    link: `/dashboard/my-requests`,
  });

export const postDonations = asyncHandler(async (req, res) => {
  const { request: requestId, donor: donorId, donatedAt, units = 1, notes = "" } = req.body;
  const amount = Number(units);
  if (!requestId || !donorId || !donatedAt)
    throw new AppError("Request, donor and donation date are required.", 400);
  if (!Number.isInteger(amount) || amount < 1 || amount > 10)
    throw new AppError("Units must be between 1 and 10.", 400);
  if (new Date(donatedAt) > new Date())
    throw new AppError("Donation date cannot be in the future.", 400);

  const [request, donor] = await Promise.all([
    BloodRequest.findById(requestId),
    DonorProfile.findById(donorId),
  ]);
  if (!request || !donor) throw new AppError("Request or donor not found.", 404);
  if ([REQUEST_STATUS.REJECTED, REQUEST_STATUS.CANCELLED, REQUEST_STATUS.FULFILLED].includes(request.status))
    throw new AppError("This request is no longer accepting donations.", 409);
  const current = await confirmedUnits(request._id);
  if (current + amount > request.units)
    throw new AppError("Units would exceed the request's requirement.", 409);

  const record = await DonationRecord.create({
    request: request._id,
    donor: donor._id,
    confirmedBy: req.user._id,
    donatedAt: new Date(donatedAt),
    units: amount,
    notes,
  });

  const updated = await recalculateRequest(request._id);
  await recalculateDonor(donor._id);

  await notifyRequester(updated, amount);
  if (donor.user) {
    await Notification.create({
      recipient: donor.user,
      title: "Donation confirmed",
      message: `Your ${amount} ${amount === 1 ? "unit has" : "units have"} been recorded for ${request.patientName}. Thank you for donating.`,
      type: "donation",
      link: "/dashboard/donations",
    });
  }
  await audit(req, "donation.confirmed", "DonationRecord", record._id, { units: amount });
  send(res, { record, request: updated }, 201);
});

export const patchDonationsById = asyncHandler(async (req, res) => {
  const { units, donatedAt, notes, status } = req.body;
  const record = await DonationRecord.findById(req.params.id);
  if (!record) throw new AppError("Donation record not found.", 404);

  if (units !== undefined) {
    const amount = Number(units);
    if (!Number.isInteger(amount) || amount < 1 || amount > 10)
      throw new AppError("Units must be between 1 and 10.", 400);
    record.units = amount;
  }
  if (donatedAt !== undefined) {
    if (new Date(donatedAt) > new Date())
      throw new AppError("Donation date cannot be in the future.", 400);
    record.donatedAt = new Date(donatedAt);
  }
  if (notes !== undefined) record.notes = notes;
  if (status !== undefined) {
    if (!["confirmed", "voided"].includes(status))
      throw new AppError("Invalid donation status.", 400);
    record.status = status;
  }

  const bloodRequest = await BloodRequest.findById(record.request).select("units");
  if (bloodRequest && record.status === "confirmed") {
    const others = await confirmedUnits(record.request, record._id);
    if (others + record.units > bloodRequest.units)
      throw new AppError("Units would exceed the request's requirement.", 409);
  }
  await record.save();

  const request = await recalculateRequest(record.request);
  await recalculateDonor(record.donor);
  await audit(req, "donation.updated", "DonationRecord", record._id);
  send(res, { record, request });
});

export const deleteDonationsById = asyncHandler(async (req, res) => {
  const record = await DonationRecord.findByIdAndDelete(req.params.id);
  if (!record) throw new AppError("Donation record not found.", 404);

  const request = await recalculateRequest(record.request);
  await recalculateDonor(record.donor);
  await audit(req, "donation.deleted", "DonationRecord", record._id);
  send(res, { request }, 200, "Donation removed and request updated.");
});

/* Donor-scoped history; the generic /donations feed is staff-only. */
export const getMyDonations = asyncHandler(async (req, res) => {
  const profile = await DonorProfile.findOne({ user: req.user._id });
  if (!profile) return send(res, { items: [] });

  const items = await DonationRecord.find({
    donor: profile._id,
    status: "confirmed",
  })
    .populate("request", "patientName bloodGroup hospitalName units unitsFulfilled")
    .populate("confirmedBy", "fullName")
    .sort({ donatedAt: -1 });
  send(res, { items });
});

export const getDonations = asyncHandler(async (req, res) => {
  const filter = { status: "confirmed" };
  if (req.query.request) filter.request = req.query.request;
  const items = await DonationRecord.find(filter)
    .populate({
      path: "donor",
      select: "bloodGroup user",
      populate: { path: "user", select: "fullName" },
    })
    .populate("request", "patientName bloodGroup units unitsFulfilled")
    .populate("confirmedBy", "fullName")
    .sort({ donatedAt: -1 });
  send(res, { items });
});
