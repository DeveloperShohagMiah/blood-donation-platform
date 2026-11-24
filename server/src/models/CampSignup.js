import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const campSignupSchema = new Schema(
  {
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
      default: "registered",
    },
  },
  opts,
);

campSignupSchema.index({ campaign: 1, user: 1 }, { unique: true });

const CampSignup = model("CampSignup", campSignupSchema);
export { CampSignup };
export default CampSignup;
