import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ["account", "request", "assignment", "donation", "campaign", "system"],
      default: "system",
    },
    link: { type: String, default: "" },
    readAt: { type: Date, default: null },
  },
  opts,
);

const Notification = model("Notification", notificationSchema);
export { Notification };
export default Notification;
