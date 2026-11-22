import {
  User,
  VolunteerProfile,
  BloodRequest,
  RequestAssignment,
  Notification,
} from "../models/index.js";
import { ROLES, ACCOUNT_STATUS, REQUEST_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit, activeAssignmentCount } from "./helpers.js";

export const postBloodRequestsByIdAssignments = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id);
  if (
    !request ||
    ![
      REQUEST_STATUS.SUBMITTED,
      REQUEST_STATUS.PENDING_VERIFICATION,
      REQUEST_STATUS.VERIFIED,
      REQUEST_STATUS.MATCHING,
      REQUEST_STATUS.IN_PROGRESS,
    ].includes(request.status)
  )
    throw new AppError("This request cannot be assigned.", 409);

  // Volunteers may claim a submitted request so they can verify it; staff assign others.
  const isVolunteer = req.user.role === ROLES.VOLUNTEER;
  let volunteerUserId = isVolunteer ? req.user._id : req.body.volunteerUserId;
  let assignmentType = isVolunteer ? "self" : "manual";

  if (!isVolunteer && req.body.mode === "automatic") {
    assignmentType = "automatic";
    const profiles = await VolunteerProfile.find({
      availability: "available",
      serviceAreas: { $in: [request.upazila, request.district].filter(Boolean) },
    }).populate({
      path: "user",
      match: { role: ROLES.VOLUNTEER, accountStatus: ACCOUNT_STATUS.APPROVED },
      select: "_id",
    });
    const candidates = [];
    for (const profile of profiles) {
      if (!profile.user) continue;
      const active = await activeAssignmentCount(profile.user._id);
      if (active < profile.maxActiveAssignments) candidates.push({ id: profile.user._id, active });
    }
    // Fall back to approved volunteer accounts that haven't set up a profile yet.
    if (!candidates.length) {
      const approvedVolunteers = await User.find({
        role: ROLES.VOLUNTEER,
        accountStatus: ACCOUNT_STATUS.APPROVED,
      }).select("_id");
      for (const volunteerUser of approvedVolunteers) {
        const active = await activeAssignmentCount(volunteerUser._id);
        if (active < 5) candidates.push({ id: volunteerUser._id, active });
      }
    }

    candidates.sort((a, b) => a.active - b.active);
    volunteerUserId = candidates[0]?.id;
    if (!volunteerUserId)
      throw new AppError(
        "No eligible volunteer is available. Request remains unassigned; notify an administrator.",
        409,
      );
  }

  if (!volunteerUserId) throw new AppError("Choose a volunteer to assign.", 400);

  const volunteer = await User.findOne({
    _id: volunteerUserId,
    role: ROLES.VOLUNTEER,
    accountStatus: ACCOUNT_STATUS.APPROVED,
  });
  if (!volunteer) throw new AppError("Approved volunteer not found.", 404);

  const alreadyAssigned = await RequestAssignment.exists({
    request: request._id,
    volunteer: volunteer._id,
    status: "active",
  });
  if (alreadyAssigned)
    throw new AppError("This volunteer is already assigned to this request.", 409);

  if (isVolunteer) {
    const profile = await VolunteerProfile.findOne({ user: req.user._id });
    const active = await activeAssignmentCount(req.user._id);
    if (profile && active >= profile.maxActiveAssignments)
      throw new AppError("You have reached your active assignment limit.", 409);
  }

  const assignment = await RequestAssignment.create({
    request: request._id,
    volunteer: volunteer._id,
    assignedBy: req.user._id,
    assignmentType,
  });

  // Don't skip verification: only move an already-verified request into matching.
  if (request.status === REQUEST_STATUS.VERIFIED) {
    request.status = REQUEST_STATUS.MATCHING;
    await request.save();
  }
  await Notification.create({
    recipient: volunteer._id,
    title: "New blood request assignment",
    message: `You have been assigned to request ${request._id}.`,
    type: "assignment",
    link: `/dashboard/assignments`,
  });
  await audit(req, "request.assignment_created", "RequestAssignment", assignment._id, {
    assignmentType,
  });
  send(res, { assignment }, 201);
});

/* All active assignments — used by admins to show who is handling a request. */
export const getAllAssignments = asyncHandler(async (req, res) => {
  const items = await RequestAssignment.find({ status: "active" })
    .populate("volunteer", "fullName phone")
    .populate("request", "patientName");
  send(res, { items });
});

/* Assignments belonging to the signed-in volunteer. */
export const getMyAssignments = asyncHandler(async (req, res) => {
  const items = await RequestAssignment.find({ volunteer: req.user._id })
    .populate({
      path: "request",
      select:
        "patientName bloodGroup units unitsFulfilled urgency hospitalName hospitalAddress district upazila neededAt expiresAt contactName contactPhone details status createdAt",
      populate: { path: "district upazila", select: "nameEn nameBn" },
    })
    .sort({ createdAt: -1 });
  send(res, { items });
});

export const getBloodRequestsByIdAssignments = asyncHandler(async (req, res) => {
  const items = await RequestAssignment.find({ request: req.params.id })
    .populate("volunteer", "fullName phone")
    .populate("assignedBy", "fullName");
  send(res, { items });
});

export const patchAssignmentsByIdStatus = asyncHandler(async (req, res) => {
  const assignment = await RequestAssignment.findById(req.params.id);
  if (!assignment) throw new AppError("Assignment not found.", 404);
  if (req.user.role === ROLES.VOLUNTEER && String(assignment.volunteer) !== String(req.user._id))
    throw new AppError("Forbidden.", 403);
  const { status, notes = "" } = req.body;
  if (!["active", "completed", "cancelled"].includes(status))
    throw new AppError("Invalid assignment status.", 400);
  assignment.status = status;
  assignment.notes = notes;
  assignment.completedAt = status === "completed" ? new Date() : null;
  await assignment.save();
  await audit(req, "assignment.status_changed", "RequestAssignment", assignment._id, { status });
  send(res, { assignment });
});
