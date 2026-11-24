import {
  BloodRequest,
  CampSignup,
  Campaign,
  DonationRecord,
  DonorResponse,
  User,
} from "../models/index.js";
import { REQUEST_STATUS } from "../constants/index.js";
import { asyncHandler, send } from "../utils/http.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const [usersByRole, requestsByStatus, donations, donorResponses, trend, signups, campaigns] =
    await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      BloodRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      DonationRecord.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, count: { $sum: 1 }, units: { $sum: "$units" } } },
      ]),
      DonorResponse.countDocuments(),
      BloodRequest.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      CampSignup.countDocuments({ status: "registered" }),
      Campaign.countDocuments({ status: "published" }),
    ]);

  const toMap = (items) =>
    Object.fromEntries(items.map((item) => [item._id, item.count]));

  const requests = toMap(requestsByStatus);
  const fulfilled = requests[REQUEST_STATUS.FULFILLED] || 0;
  const totalRequests = Object.values(requests).reduce((sum, value) => sum + value, 0);

  send(res, {
    users: {
      total: Object.values(toMap(usersByRole)).reduce((sum, value) => sum + value, 0),
      byRole: toMap(usersByRole),
    },
    requests: {
      total: totalRequests,
      byStatus: requests,
      fulfillmentRate: totalRequests
        ? Math.round((fulfilled / totalRequests) * 100)
        : 0,
    },
    donations: {
      count: donations[0]?.count || 0,
      units: donations[0]?.units || 0,
    },
    donorResponses,
    camps: { publishedCampaigns: campaigns, registrations: signups },
    trend: trend.map((item) => ({ month: item._id, count: item.count })),
  });
});

const csvCell = (value) => {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const sendCsv = (res, filename, columns, rows) => {
  const lines = [columns.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(lines.join("\r\n"));
};

export const exportRequestsCsv = asyncHandler(async (req, res) => {
  const items = await BloodRequest.find()
    .select(
      "patientName bloodGroup urgency units unitsFulfilled hospitalName district status neededAt createdAt"
    )
    .populate("district", "nameEn")
    .sort({ createdAt: -1 })
    .lean();
  sendCsv(
    res,
    "blood-requests.csv",
    ["Patient", "Blood group", "Urgency", "Units", "Fulfilled", "Hospital", "District", "Status", "Needed", "Created"],
    items.map((item) => [
      item.patientName,
      item.bloodGroup,
      item.urgency,
      item.units,
      item.unitsFulfilled,
      item.hospitalName,
      item.district?.nameEn || "",
      item.status,
      item.neededAt,
      item.createdAt,
    ])
  );
});

export const exportDonationsCsv = asyncHandler(async (req, res) => {
  const items = await DonationRecord.find()
    .populate({ path: "request", select: "patientName bloodGroup" })
    .sort({ donatedAt: -1 })
    .lean();
  sendCsv(
    res,
    "donations.csv",
    ["Patient", "Blood group", "Donated at", "Units", "Status", "Notes"],
    items.map((item) => [
      item.request?.patientName || "",
      item.request?.bloodGroup || "",
      item.donatedAt,
      item.units,
      item.status,
      item.notes,
    ])
  );
});
