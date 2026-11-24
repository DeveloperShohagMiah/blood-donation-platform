import {
  BloodRequest,
  DonorResponse,
  Notification,
  RequestAssignment,
  RequestMessage,
  User,
} from "../models/index.js";
import { ACCOUNT_STATUS, ROLES } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";

const STAFF_ROLES = [ROLES.ADMIN, ROLES.MODERATOR, ROLES.VOLUNTEER];

/* Everyone involved in a request can read and write in its thread. */
const participantIds = async (request) => {
  const ids = new Set([String(request.requester)]);

  const [assignments, staff, responses] = await Promise.all([
    RequestAssignment.find({ request: request._id, status: "active" }).select("volunteer"),
    User.find({ role: { $in: STAFF_ROLES }, accountStatus: ACCOUNT_STATUS.APPROVED }).select("_id"),
    DonorResponse.find({
      request: request._id,
      response: { $in: ["accepted", "interested"] },
    }).populate({ path: "donor", select: "user" }),
  ]);

  assignments.forEach((item) => ids.add(String(item.volunteer)));
  staff.forEach((item) => ids.add(String(item._id)));
  responses.forEach((item) => {
    if (item.donor?.user) ids.add(String(item.donor.user));
  });
  return ids;
};

export const getRequestMessages = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id).select("requester");
  if (!request) throw new AppError("Request not found.", 404);
  if (!(await participantIds(request)).has(String(req.user._id)))
    throw new AppError("You are not part of this conversation.", 403);

  const items = await RequestMessage.find({ request: req.params.id })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("sender", "fullName role")
    .populate("recipient", "fullName role");
  send(res, { items });
});

export const postRequestMessage = asyncHandler(async (req, res) => {
  const body = String(req.body?.body || "").trim();
  if (!body) throw new AppError("Message cannot be empty.", 400);

  const request = await BloodRequest.findById(req.params.id).select("requester patientName");
  if (!request) throw new AppError("Request not found.", 404);

  const participants = await participantIds(request);
  if (!participants.has(String(req.user._id)))
    throw new AppError("You are not part of this conversation.", 403);

  const recipient = req.body?.recipient || null;
  if (recipient && !participants.has(String(recipient)))
    throw new AppError("Recipient is not part of this conversation.", 400);

  const message = await RequestMessage.create({
    request: request._id,
    sender: req.user._id,
    recipient,
    body,
  });

  const recipients = recipient
    ? [String(recipient)]
    : [...participants].filter((id) => id !== String(req.user._id));

  if (recipients.length) {
    const users = await User.find({ _id: { $in: recipients } }).select("role");
    await Notification.insertMany(
      users.map((user) => ({
        recipient: user._id,
        title: "New message about a blood request",
        message: `${req.user.fullName}: ${body.slice(0, 120)}`,
        type: "request",
        link: STAFF_ROLES.includes(user.role)
          ? `/dashboard/admin/requests?request=${request._id}&messages=1`
          : `/dashboard/matching?request=${request._id}&messages=1`,
      }))
    );
  }

  send(res, { message }, 201);
});
