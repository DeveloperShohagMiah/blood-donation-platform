import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const requestMessageSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: "BloodRequest", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", default: null },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  opts,
);

const RequestMessage = model("RequestMessage", requestMessageSchema);
export { RequestMessage };
export default RequestMessage;
