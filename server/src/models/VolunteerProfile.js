import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const volunteerProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    serviceAreas: [{ type: Schema.Types.ObjectId, ref: "Location" }],
    availability: { type: String, enum: ["available", "unavailable"], default: "unavailable" },
    maxActiveAssignments: { type: Number, min: 1, max: 50, default: 5 },
    joinedAt: { type: Date, default: Date.now },
    adminNote: { type: String, select: false, maxlength: 1000, default: "" },
  },
  opts,
);

const VolunteerProfile = model("VolunteerProfile", volunteerProfileSchema);
export { VolunteerProfile };
export default VolunteerProfile;
