import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const verificationCodeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channel: {
      type: String,
      enum: ["phone", "email", "password_reset"],
      required: true,
    },
    target: { type: String, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },
  },
  opts,
);

const VerificationCode = model("VerificationCode", verificationCodeSchema);
export { VerificationCode };
export default VerificationCode;
