import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const contactRequestSchema = new Schema(
  {
    donor: { type: Schema.Types.ObjectId, ref: "DonorProfile", required: true },
    requesterName: { type: String, required: true, trim: true, maxlength: 100 },
    requesterPhone: { type: String, required: true, trim: true },
    message: { type: String, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "contacted", "closed", "rejected"],
      default: "pending",
    },
    handledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  opts,
);

const ContactRequest = model("ContactRequest", contactRequestSchema);
export { ContactRequest };
export default ContactRequest;
