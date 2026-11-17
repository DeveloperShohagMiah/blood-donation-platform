import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const assignmentSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    volunteer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignmentType: { type: String, enum: ["manual", "automatic", "self"], required: true },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    notes: { type: String, maxlength: 1000, default: "" },
    completedAt: { type: Date, default: null },
  },
  opts,
);

const RequestAssignment = model("RequestAssignment", assignmentSchema);
export { RequestAssignment };
export default RequestAssignment;
