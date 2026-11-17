import { AuditLog } from "../models/index.js";
import { asyncHandler, send } from "../utils/http.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.resourceType) filter.resourceType = req.query.resourceType;
  if (req.query.resourceId) filter.resourceId = req.query.resourceId;
  const items = await AuditLog.find(filter)
    .populate("actor", "fullName role")
    .sort({ createdAt: -1 })
    .limit(200);
  send(res, { items });
});
