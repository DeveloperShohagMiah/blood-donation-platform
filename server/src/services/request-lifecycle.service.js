import {
  AuditLog,
  BloodRequest,
  DonationRecord,
  DonorProfile,
  DonorResponse,
  Notification,
} from "../models/index.js";
import { REQUEST_STATUS } from "../constants/index.js";

const HOUR = 60 * 60 * 1000;
const ACTIVE_STATUSES = [
  REQUEST_STATUS.SUBMITTED,
  REQUEST_STATUS.PENDING_VERIFICATION,
  REQUEST_STATUS.VERIFIED,
  REQUEST_STATUS.MATCHING,
  REQUEST_STATUS.IN_PROGRESS,
];
const CLOSED_STATUSES = [
  REQUEST_STATUS.FULFILLED,
  REQUEST_STATUS.EXPIRED,
  REQUEST_STATUS.CANCELLED,
  REQUEST_STATUS.REJECTED,
];

/* Requests past their deadline are closed and everyone involved is told. */
export const expireStaleRequests = async () => {
  const stale = await BloodRequest.find({
    status: { $in: ACTIVE_STATUSES },
    expiresAt: { $lt: new Date() },
  }).select("_id patientName requester");

  for (const request of stale) {
    await BloodRequest.updateOne(
      { _id: request._id },
      { $set: { status: REQUEST_STATUS.EXPIRED } }
    );

    const responses = await DonorResponse.find({
      request: request._id,
      response: { $in: ["interested", "accepted"] },
    }).select("donor");
    const profiles = await DonorProfile.find({
      _id: { $in: responses.map((item) => item.donor) },
    }).select("user");

    const notices = [
      {
        recipient: request.requester,
        title: "Blood request expired",
        message: `Your request for ${request.patientName} has expired. Please submit a new request if blood is still needed.`,
        type: "request",
        link: "/dashboard/my-requests",
      },
      ...profiles
        .filter((profile) => profile.user)
        .map((profile) => ({
          recipient: profile.user,
          title: "Blood request expired",
          message: `The request for ${request.patientName} is no longer active. Thank you for offering to help.`,
          type: "request",
          link: "/dashboard/matching",
        })),
    ];
    if (notices.length) await Notification.insertMany(notices);
    await AuditLog.create({
      action: "blood_request.expired",
      resourceType: "BloodRequest",
      resourceId: request._id,
    });
  }

  return stale.length;
};

/* Offers still pending on a closed request are declined automatically. */
export const declinePendingOffers = async () => {
  const closed = await BloodRequest.find({
    status: { $in: CLOSED_STATUSES },
  }).select("_id");

  const pending = await DonorResponse.find({
    request: { $in: closed.map((item) => item._id) },
    response: "interested",
  })
    .populate({ path: "donor", select: "user" })
    .populate("request", "patientName");

  for (const response of pending) {
    response.response = "declined";
    await response.save();

    if (response.donor?.user) {
      await Notification.create({
        recipient: response.donor.user,
        title: "Donor offer update",
        message: `Your offer for ${response.request?.patientName || "a blood request"} was closed because the request is no longer active. Thank you for being ready to help.`,
        type: "account",
        link: "/dashboard/matching",
      });
    }
  }

  return pending.length;
};

/* Notify available donors with a matching group when a request is verified. */
export const notifyMatchingDonors = async (request) => {
  const donors = await DonorProfile.find({
    availability: "available",
    bloodGroup: request.bloodGroup,
    $or: [
      { district: request.district },
      ...(request.division ? [{ division: request.division }] : []),
    ],
  })
    .select("user")
    .limit(100);

  const link = `/dashboard/matching?request=${request._id}`;
  const alreadySent = await Notification.find({
    title: "New matching request",
    link,
  }).select("recipient");
  const sent = new Set(alreadySent.map((item) => String(item.recipient)));

  const notices = donors
    .filter((donor) => donor.user && !sent.has(String(donor.user)))
    .map((donor) => ({
      recipient: donor.user,
      title: "New matching request",
      message: `A verified ${request.bloodGroup} request for ${request.patientName} is looking for donors near you.`,
      type: "request",
      link,
    }));

  if (notices.length) await Notification.insertMany(notices);
  return notices.length;
};

/* Remind selected donors a day before the needed date if no donation is recorded. */
export const remindSelectedDonors = async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * HOUR);
  const requests = await BloodRequest.find({
    status: { $in: [REQUEST_STATUS.MATCHING, REQUEST_STATUS.IN_PROGRESS] },
    neededAt: { $gte: now, $lte: soon },
  }).select("_id patientName");

  let reminders = 0;
  for (const request of requests) {
    const responses = await DonorResponse.find({
      request: request._id,
      response: "accepted",
    }).populate({ path: "donor", select: "user" });
    const donations = await DonationRecord.find({
      request: request._id,
      status: "confirmed",
    }).select("donor");
    const donated = new Set(donations.map((item) => String(item.donor)));

    for (const response of responses) {
      if (!response.donor?.user || donated.has(String(response.donor._id))) continue;
      const existing = await Notification.exists({
        recipient: response.donor.user,
        title: "Donation reminder",
        link: `/dashboard/matching?request=${request._id}`,
        createdAt: { $gte: new Date(now.getTime() - 12 * HOUR) },
      });
      if (existing) continue;

      await Notification.create({
        recipient: response.donor.user,
        title: "Donation reminder",
        message: `You're selected for ${request.patientName}'s blood request. Please complete your donation soon or withdraw your offer.`,
        type: "assignment",
        link: `/dashboard/matching?request=${request._id}`,
      });
      reminders += 1;
    }
  }

  return reminders;
};

/* Single entry point used by the startup job and the hourly timer. */
export const runLifecycleJobs = async () => {
  const result = {
    expired: await expireStaleRequests(),
    declined: await declinePendingOffers(),
    reminders: await remindSelectedDonors(),
  };
  return result;
};
