import {
  DonorProfile,
  BloodRequest,
  DonorResponse,
  User,
  Notification,
} from "../models/index.js";
import { REQUEST_STATUS, ROLES, ACCOUNT_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit } from "./helpers.js";

export const postBloodRequestsByIdResponses = asyncHandler(async (req, res) => {
  const profile = await DonorProfile.findOne({ user: req.user._id });
  if (!profile || profile.availability !== "available")
    throw new AppError("An available donor profile is required.", 403);
  const request = await BloodRequest.findById(req.params.id);
  if (
    !request ||
    ![REQUEST_STATUS.VERIFIED, REQUEST_STATUS.MATCHING, REQUEST_STATUS.IN_PROGRESS].includes(
      request.status,
    )
  )
    throw new AppError("This request is not accepting donor responses.", 409);
  const response = await DonorResponse.findOneAndUpdate(
    { request: request._id, donor: profile._id },
    {
      response: req.body.response || "interested",
      note: req.body.note || "",
      respondedAt: new Date(),
    },
    { new: true, upsert: true, runValidators: true },
  );
  await audit(req, "donor.response_submitted", "DonorResponse", response._id);

  const recipients = await User.find({
    role: { $in: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.VOLUNTEER] },
    accountStatus: ACCOUNT_STATUS.APPROVED,
    _id: { $ne: req.user._id },
  }).select("role");
  if (recipients.length) {
    const message = `${req.user.fullName} (${profile.bloodGroup}) is ready to donate for ${request.patientName}.`;
    await Notification.insertMany(
      recipients.map((recipient) => ({
        recipient: recipient._id,
        title: "New donor response",
        message,
        type: "assignment",
        link: [ROLES.ADMIN, ROLES.MODERATOR].includes(recipient.role)
          ? `/dashboard/admin/requests?request=${request._id}`
          : `/dashboard/assignments?request=${request._id}`,
      }))
    );
  }

  send(res, { response }, 201);
});

export const getBloodRequestsByIdResponses = asyncHandler(async (req, res) => {
  const items = await DonorResponse.find({ request: req.params.id }).populate({
    path: "donor",
    select: "bloodGroup availability area user",
    populate: { path: "user", select: "fullName" },
  });
  send(res, { items });
});
