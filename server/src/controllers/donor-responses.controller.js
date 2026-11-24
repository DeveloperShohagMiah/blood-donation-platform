import {
  DonorProfile,
  BloodRequest,
  DonorResponse,
  User,
  Notification,
} from "../models/index.js";
import { REQUEST_STATUS, ROLES, ACCOUNT_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit, isInCooldown } from "./helpers.js";

export const postBloodRequestsByIdResponses = asyncHandler(async (req, res) => {
  const profile = await DonorProfile.findOne({ user: req.user._id });
  if (!profile || profile.availability !== "available")
    throw new AppError("An available donor profile is required.", 403);
  if (isInCooldown(profile.lastDonationDate))
    throw new AppError("You can donate again after the 90-day rest period.", 403);
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

/* Coordinator decision on a donor's offer — the donor is always notified. */
export const patchDonorResponseDecision = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  if (!["accept", "decline"].includes(decision))
    throw new AppError("Invalid decision.", 400);

  const response = await DonorResponse.findById(req.params.responseId)
    .populate({ path: "donor", select: "user", populate: { path: "user", select: "fullName" } })
    .populate("request", "patientName");
  if (!response) throw new AppError("Donor response not found.", 404);
  if (!["interested", "accepted", "declined"].includes(response.response))
    throw new AppError("This offer can no longer be reviewed.", 409);
  if (!response.donor?.user || !response.request)
    throw new AppError("Donor or request no longer exists.", 404);

  response.response = decision === "accept" ? "accepted" : "declined";
  await response.save();

  await Notification.create({
    recipient: response.donor.user._id,
    title: decision === "accept" ? "You've been selected to donate" : "Donor offer update",
    message:
      decision === "accept"
        ? `You've been selected for ${response.request.patientName}'s blood request. A volunteer will contact you with the next steps.`
        : `Your offer for ${response.request.patientName}'s blood request was not selected this time. Thank you for being ready to help.`,
    type: decision === "accept" ? "assignment" : "account",
    link: `/dashboard/matching?request=${response.request._id}`,
  });
  await audit(req, `donor.response_${decision}`, "DonorResponse", response._id);

  send(res, { response });
});

export const getBloodRequestsByIdResponses = asyncHandler(async (req, res) => {
  const items = await DonorResponse.find({ request: req.params.id }).populate({
    path: "donor",
    select: "bloodGroup availability area user",
    populate: { path: "user", select: "fullName" },
  });
  send(res, { items });
});
