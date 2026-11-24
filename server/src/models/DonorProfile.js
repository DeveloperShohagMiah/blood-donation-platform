import mongoose from "mongoose";
import { BLOOD_GROUPS, DONOR_AVAILABILITY } from "../constants/index.js";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const donorProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    lastDonationDate: {
      type: Date,
      default: null,
      validate: {
        validator: (v) => !v || v <= new Date(),
        message: "Last donation date cannot be in the future.",
      },
    },
    availability: { type: String, enum: DONOR_AVAILABILITY, default: "unavailable" },
    division: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    district: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    upazila: { type: Schema.Types.ObjectId, ref: "Location", default: null },
    union: { type: Schema.Types.ObjectId, ref: "Location", default: null },
    area: { type: String, trim: true, maxlength: 150, default: "" },
    lat: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
      validate: (v) => v === null || v === undefined || (v >= -90 && v <= 90),
    },
    lng: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
      validate: (v) => v === null || v === undefined || (v >= -180 && v <= 180),
    },
    isPubliclyListed: { type: Boolean, default: false },
    allowContactRequests: { type: Boolean, default: false },
    consentUpdatedAt: { type: Date, default: null },
    adminNote: { type: String, select: false, maxlength: 1000, default: "" },
  },
  opts,
);

const DonorProfile = model("DonorProfile", donorProfileSchema);
export { DonorProfile };
export default DonorProfile;
