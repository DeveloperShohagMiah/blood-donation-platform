import {
    User,
    BloodRequest,
    DonorProfile,
    VolunteerProfile,
    ContactRequest,
    DonationRecord,
    Campaign,
    RequestAssignment,
} from "../models/index.js";
import { asyncHandler, send } from "../utils/http.js";

const countByGroup = async (model, field) => {
    const rows = await model.aggregate([
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((row) => [String(row._id), row.count]));
};

/* One aggregated response for the admin dashboard KPI cards. */
export const getAdminStats = asyncHandler(async (req, res) => {
    const [
        usersByStatus,
        usersByRole,
        requestsByStatus,
        availableDonors,
        availableVolunteers,
        pendingContacts,
        activeAssignments,
        confirmedDonations,
        publishedCampaigns,
    ] = await Promise.all([
        countByGroup(User, "accountStatus"),
        countByGroup(User, "role"),
        countByGroup(BloodRequest, "status"),
        DonorProfile.countDocuments({
            isPubliclyListed: true,
            availability: "available",
        }),
        VolunteerProfile.countDocuments({ availability: "available" }),
        ContactRequest.countDocuments({ status: "pending" }),
        RequestAssignment.countDocuments({ status: "active" }),
        DonationRecord.countDocuments({ status: "confirmed" }),
        Campaign.countDocuments({ status: "published" }),
    ]);

    send(res, {
        users: {
            total: Object.values(usersByStatus).reduce((a, b) => a + b, 0),
            byStatus: usersByStatus,
            byRole: usersByRole,
        },
        requests: {
            total: Object.values(requestsByStatus).reduce((a, b) => a + b, 0),
            byStatus: requestsByStatus,
        },
        availableDonors,
        availableVolunteers,
        pendingContacts,
        activeAssignments,
        confirmedDonations,
        publishedCampaigns,
    });
});
