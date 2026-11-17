import { VolunteerProfile } from "../models/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit } from "./helpers.js";

export const getVolunteersMe = asyncHandler(async (req, res) => {
  const profile = await VolunteerProfile.findOne({ user: req.user._id }).populate(
    "serviceAreas",
    "nameEn nameBn type",
  );
  send(res, { profile });
});

export const getVolunteerById = asyncHandler(async (req, res) => {
  const item = await VolunteerProfile.findById(req.params.id)
    .populate("user", "fullName phone accountStatus")
    .populate("serviceAreas", "nameEn nameBn type");
  if (!item) throw new AppError("Volunteer profile not found.", 404);
  send(res, { item });
});

export const putVolunteersMe = asyncHandler(async (req, res) => {
  const { serviceAreas = [], availability = "unavailable", maxActiveAssignments = 5 } = req.body;
  if (!Array.isArray(serviceAreas)) throw new AppError("serviceAreas must be an array.", 400);
  const profile = await VolunteerProfile.findOneAndUpdate(
    { user: req.user._id },
    { serviceAreas, availability, maxActiveAssignments },
    { new: true, upsert: true, runValidators: true },
  );
  await audit(req, "volunteer.profile_updated", "VolunteerProfile", profile._id);
  send(res, { profile });
});

export const getVolunteers = asyncHandler(async (req, res) => {
  const items = await VolunteerProfile.find()
    .populate("user", "fullName phone accountStatus")
    .populate("serviceAreas", "nameEn nameBn type");
  send(res, { items });
});
