import { User, DonorProfile, Notification, ContactRequest } from "../models/index.js";
import { ROLES, ACCOUNT_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit } from "./helpers.js";

export const postContactRequests = asyncHandler(async (req, res) => {
  const { donorId, requesterName, requesterPhone, message = "" } = req.body;
  const donor = await DonorProfile.findOne({
    _id: donorId,
    isPubliclyListed: true,
    allowContactRequests: true,
    availability: "available",
  });
  if (!donor) throw new AppError("This donor is not accepting contact requests.", 404);
  const item = await ContactRequest.create({
    donor: donor._id,
    requesterName,
    requesterPhone,
    message,
  });
  const admins = await User.find({
    role: { $in: [ROLES.ADMIN, ROLES.MODERATOR] },
    accountStatus: ACCOUNT_STATUS.APPROVED,
  }).select("_id");
  if (admins.length)
    await Notification.insertMany(
      admins.map(({ _id }) => ({
        recipient: _id,
        title: "New donor contact request",
        message: `A contact request was submitted for donor profile ${donor._id}.`,
        type: "system",
      })),
    );
  send(
    res,
    { id: item._id, status: item.status },
    201,
    "Your contact request has been sent to the foundation.",
  );
});

export const getContactRequests = asyncHandler(async (req, res) => {
  const items = await ContactRequest.find()
    .populate({
      path: "donor",
      select: "bloodGroup area user",
      populate: { path: "user", select: "fullName" },
    })
    .sort({ createdAt: -1 });
  send(res, { items });
});

export const patchContactRequestsByIdStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "contacted", "closed", "rejected"].includes(status))
    throw new AppError("Invalid status.", 400);
  const item = await ContactRequest.findByIdAndUpdate(
    req.params.id,
    { status, handledBy: req.user._id },
    { new: true },
  );
  if (!item) throw new AppError("Contact request not found.", 404);
  await audit(req, "contact_request.status_changed", "ContactRequest", item._id, { status });
  send(res, { item });
});
