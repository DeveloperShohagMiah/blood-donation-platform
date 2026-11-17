import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const donorResponseSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    donor: { type: Schema.Types.ObjectId, ref: "DonorProfile", required: true },
    response: {
      type: String,
      enum: ["interested", "accepted", "declined", "withdrawn"],
      required: true,
    },
    note: { type: String, maxlength: 500, default: "" },
    respondedAt: { type: Date, default: Date.now },
  },
  opts,
);

const DonorResponse = model("DonorResponse", donorResponseSchema);
export { DonorResponse };
export default DonorResponse;
