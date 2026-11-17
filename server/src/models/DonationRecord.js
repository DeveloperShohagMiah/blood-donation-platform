import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const donationRecordSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    donor: { type: Schema.Types.ObjectId, ref: "DonorProfile", required: true },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    donatedAt: { type: Date, required: true },
    units: { type: Number, min: 1, max: 10, default: 1 },
    status: { type: String, enum: ["confirmed", "voided"], default: "confirmed" },
    notes: { type: String, maxlength: 1000, default: "" },
  },
  opts,
);

const DonationRecord = model("DonationRecord", donationRecordSchema);
export { DonationRecord };
export default DonationRecord;
