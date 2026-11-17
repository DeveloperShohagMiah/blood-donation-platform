import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const campaignSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", default: null },
    venue: { type: String, maxlength: 300, default: "" },
    banner: { url: String, publicId: String },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  opts,
);

const Campaign = model("Campaign", campaignSchema);
export { Campaign };
export default Campaign;
