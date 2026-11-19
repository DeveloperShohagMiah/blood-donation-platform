import {
  BloodRequest,
  RequestAssignment,
  Notification,
  DonorProfile,
  DonorResponse,
} from "../models/index.js";
import { ROLES, REQUEST_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send, pick } from "../utils/http.js";
import { audit, validateLocation } from "./helpers.js";

export const postBloodRequests = asyncHandler(async (req, res) => {
  const body = pick(req.body, [
    "patientName",
    "bloodGroup",
    "urgency",
    "units",
    "hospitalName",
    "hospitalAddress",
    "division",
    "district",
    "upazila",
    "union",
    "neededAt",
    "contactName",
    "contactPhone",
    "details",
  ]);
  await validateLocation(body);
  const units = Number(body.units);
  if (!Number.isInteger(units) || units < 1 || units > 10)
    throw new AppError("Units must be a whole number between 1 and 10.", 400);
  const neededAt = new Date(body.neededAt);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (Number.isNaN(neededAt.getTime()) || neededAt < startOfToday)
    throw new AppError("neededAt must be today or a future date.", 400);
  // A date-only input becomes 00:00 UTC; keep it visible through that whole day.
  const expiresAt = new Date(neededAt);
  expiresAt.setUTCHours(23, 59, 59, 999);

  const request = await BloodRequest.create({
    ...body,
    requester: req.user._id,
    status: REQUEST_STATUS.SUBMITTED,
    expiresAt,
  });
  await audit(req, "blood_request.submitted", "BloodRequest", request._id);
  send(res, { request }, 201, "Request submitted for volunteer verification.");
});

export const patchBloodRequestsByIdCancel = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id);
  if (!request) throw new AppError("Request not found.", 404);
  const isOwner = String(request.requester) === String(req.user._id);
  if (!isOwner && ![ROLES.ADMIN, ROLES.MODERATOR].includes(req.user.role))
    throw new AppError("Forbidden.", 403);
  if (
    [REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED, REQUEST_STATUS.REJECTED].includes(
      request.status,
    )
  )
    throw new AppError("This request cannot be cancelled.", 409);
  request.status = REQUEST_STATUS.CANCELLED;
  await request.save();
  await RequestAssignment.updateMany(
    { request: request._id, status: "active" },
    { status: "cancelled" },
  );
  await audit(req, "blood_request.cancelled", "BloodRequest", request._id);
  send(res, { request });
});

export const getBloodRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === ROLES.USER) filter.requester = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.district) filter.district = req.query.district;
  if (req.query.upazila) filter.upazila = req.query.upazila;
  if (req.query.union) filter.union = req.query.union;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    BloodRequest.find(filter)
      .populate("requester", "fullName")
      .populate("district upazila union", "nameEn nameBn")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BloodRequest.countDocuments(filter),
  ]);
  send(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

/* Public, read-only feed for the home page, including pending requests.
   Contact details are only exposed once a volunteer has verified the request. */
export const getPublicBloodRequests = asyncHandler(async (req, res) => {
  const verifiedStatuses = [
    REQUEST_STATUS.VERIFIED,
    REQUEST_STATUS.MATCHING,
    REQUEST_STATUS.IN_PROGRESS,
  ];

  const [items, respondedIds] = await Promise.all([
    BloodRequest.find({
      status: {
        $in: [
          REQUEST_STATUS.SUBMITTED,
          REQUEST_STATUS.PENDING_VERIFICATION,
          ...verifiedStatuses,
        ],
      },
      expiresAt: { $gt: new Date() },
    })
      .select(
        "patientName bloodGroup urgency units unitsFulfilled hospitalName district upazila union neededAt contactName contactPhone createdAt details status",
      )
      .populate("district upazila union", "nameEn nameBn")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    (async () => {
      if (!req.user) return new Set();
      const profile = await DonorProfile.findOne({ user: req.user._id }).select("_id");
      if (!profile) return new Set();
      const responses = await DonorResponse.find({
        donor: profile._id,
        response: { $in: ["interested", "accepted"] },
      }).select("request");
      return new Set(responses.map((item) => String(item.request)));
    })(),
  ]);

  const publicItems = items.map((item) => {
    const isVerified = verifiedStatuses.includes(item.status);
    return {
      ...item,
      isVerified,
      hasResponded: respondedIds.has(String(item._id)),
      contactName: isVerified ? item.contactName : undefined,
      contactPhone: isVerified ? item.contactPhone : undefined,
    };
  });

  send(res, { items: publicItems });
});

export const getBloodRequestsById = asyncHandler(async (req, res) => {
  const item = await BloodRequest.findById(req.params.id)
    .populate("requester", "fullName")
    .populate("district upazila union", "nameEn nameBn");
  if (!item) throw new AppError("Request not found.", 404);
  if (req.user.role === ROLES.USER && String(item.requester._id) !== String(req.user._id))
    throw new AppError("Forbidden.", 403);
  send(res, { item });
});

export const patchBloodRequestsByIdVerify = asyncHandler(async (req, res) => {
  const { decision, note = "", rejectionReason = "" } = req.body;
  const item = await BloodRequest.findById(req.params.id);
  if (!item) throw new AppError("Request not found.", 404);
  if (
    item.status !== REQUEST_STATUS.SUBMITTED &&
    item.status !== REQUEST_STATUS.PENDING_VERIFICATION
  )
    throw new AppError("Only submitted requests can be verified.", 409);
  if (req.user.role === ROLES.VOLUNTEER) {
    const assigned = await RequestAssignment.exists({
      request: item._id,
      volunteer: req.user._id,
      status: "active",
    });
    if (!assigned)
      throw new AppError("You must be assigned to this request before verifying it.", 403);
  }
  if (decision === "verify") {
    item.status = REQUEST_STATUS.VERIFIED;
    item.verifiedBy = req.user._id;
    item.verifiedAt = new Date();
    item.verificationNote = note;
  } else if (decision === "reject") {
    item.status = REQUEST_STATUS.REJECTED;
    item.rejectedBy = req.user._id;
    item.rejectionReason = rejectionReason;
  } else throw new AppError("Decision must be verify or reject.", 400);
  await item.save();
  await Notification.create({
    recipient: item.requester,
    title: "Blood request updated",
    message: `Your request was ${decision === "verify" ? "verified" : "rejected"}.`,
    type: "request",
  });
  await audit(req, `blood_request.${decision}`, "BloodRequest", item._id);
  send(res, { request: item });
});
