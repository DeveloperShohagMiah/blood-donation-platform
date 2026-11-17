import mongoose from "mongoose";
import { BLOOD_GROUPS, REQUEST_STATUS } from "../constants/index.js";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const bloodRequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
  patientName: { type: String, required: true, trim: true, maxlength: 100 },
  bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
  urgency: {
    type: String,
    enum: ["normal", "urgent", "critical"],
    default: "normal",
  },
  units: { type: Number, required: true, min: 1, max: 10 },
  unitsFulfilled: { type: Number, default: 0, min: 0 },
  hospitalName: { type: String, required: true, trim: true, maxlength: 150 },
  hospitalAddress: { type: String, required: true, trim: true, maxlength: 300 },
  division: { type: Schema.Types.ObjectId, ref: "Location", required: true },
  district: { type: Schema.Types.ObjectId, ref: "Location", required: true },
  upazila: { type: Schema.Types.ObjectId, ref: "Location", default: null },
  neededAt: { type: Date, required: true },
  contactName: { type: String, required: true, trim: true, maxlength: 100 },
  contactPhone: { type: String, required: true, trim: true },
  details: { type: String, trim: true, maxlength: 2000, default: "" },
  status: { type: String, enum: Object.values(REQUEST_STATUS), default: REQUEST_STATUS.SUBMITTED },
  verificationNote: { type: String, maxlength: 1000, default: "" },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  verifiedAt: { type: Date, default: null },
  rejectedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  rejectionReason: { type: String, maxlength: 500, default: "" },
  expiresAt: { type: Date, required: true }
}, opts);

const BloodRequest = model("BloodRequest", bloodRequestSchema);
export { BloodRequest };
export default BloodRequest;
