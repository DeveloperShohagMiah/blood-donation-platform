import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true, maxlength: 100 },
    resourceType: { type: String, required: true, maxlength: 100 },
    resourceId: { type: Schema.Types.ObjectId, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, maxlength: 80, default: "" },
  },
  { ...opts, versionKey: false },
);

const AuditLog = model("AuditLog", auditLogSchema);
export { AuditLog };
export default AuditLog;
