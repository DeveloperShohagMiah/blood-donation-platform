import { Campaign, CampSignup, Notification } from "../models/index.js";
import { ROLES } from "../constants/index.js";
import { AppError, asyncHandler, send, pick } from "../utils/http.js";
import { audit } from "./helpers.js";

export const getCampaigns = asyncHandler(async (req, res) => {
  const filter =
    req.user?.role && [ROLES.ADMIN, ROLES.MODERATOR].includes(req.user.role)
      ? {}
      : { status: "published" };
  const campaigns = await Campaign.find(filter).sort({ startAt: 1 }).lean();
  const mine = req.user
    ? await CampSignup.find({
        user: req.user._id,
        status: "registered",
        campaign: { $in: campaigns.map((item) => item._id) },
      }).select("campaign")
    : [];
  const registered = new Set(mine.map((item) => String(item.campaign)));

  const items = await Promise.all(
    campaigns.map(async (campaign) => {
      const signupCount = await CampSignup.countDocuments({
        campaign: campaign._id,
        status: "registered",
      });
      return {
        ...campaign,
        signupCount,
        spotsLeft:
          campaign.capacity === null || campaign.capacity === undefined
            ? null
            : Math.max(0, campaign.capacity - signupCount),
        isRegistered: registered.has(String(campaign._id)),
      };
    })
  );
  send(res, { items });
});

export const getCampaignById = asyncHandler(async (req, res) => {
  const item = await Campaign.findById(req.params.id);
  if (!item) throw new AppError("Campaign not found.", 404);
  send(res, { item });
});

export const postCampaigns = asyncHandler(async (req, res) => {
  const body = pick(req.body, [
    "title",
    "description",
    "startAt",
    "endAt",
    "location",
    "venue",
    "banner",
    "status",
    "capacity",
  ]);
  const item = await Campaign.create({ ...body, createdBy: req.user._id });
  await audit(req, "campaign.created", "Campaign", item._id);
  send(res, { item }, 201);
});

export const patchCampaignsById = asyncHandler(async (req, res) => {
  const item = await Campaign.findByIdAndUpdate(
    req.params.id,
    pick(req.body, [
      "title",
      "description",
      "startAt",
      "endAt",
      "location",
      "venue",
      "banner",
      "status",
      "capacity",
    ]),
    { new: true, runValidators: true },
  );
  if (!item) throw new AppError("Campaign not found.", 404);
  await audit(req, "campaign.updated", "Campaign", item._id);
  send(res, { item });
});

export const postCampaignSignup = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new AppError("Campaign not found.", 404);
  if (campaign.status !== "published")
    throw new AppError("This campaign is not open for sign-ups.", 409);
  if (new Date(campaign.startAt) <= new Date())
    throw new AppError("Sign-ups are closed for this campaign.", 409);

  const existing = await CampSignup.findOne({
    campaign: campaign._id,
    user: req.user._id,
  });
  if (existing?.status === "registered")
    throw new AppError("You're already registered for this campaign.", 409);

  if (campaign.capacity) {
    const count = await CampSignup.countDocuments({
      campaign: campaign._id,
      status: "registered",
    });
    if (count >= campaign.capacity)
      throw new AppError("This campaign is full.", 409);
  }

  const signup = await CampSignup.findOneAndUpdate(
    { campaign: campaign._id, user: req.user._id },
    { status: "registered" },
    { new: true, upsert: true, runValidators: true }
  );
  await Notification.create({
    recipient: req.user._id,
    title: "Camp registration confirmed",
    message: `You're registered for ${campaign.title} on ${new Date(campaign.startAt).toLocaleDateString()}.`,
    type: "campaign",
    link: `/campaigns`,
  });
  await audit(req, "campaign.signup", "Campaign", campaign._id);
  send(res, { signup }, 201);
});

export const deleteCampaignSignup = asyncHandler(async (req, res) => {
  await CampSignup.updateOne(
    { campaign: req.params.id, user: req.user._id },
    { status: "cancelled" }
  );
  send(res, { success: true }, 200, "Registration cancelled.");
});

export const getCampaignSignups = asyncHandler(async (req, res) => {
  const items = await CampSignup.find({ campaign: req.params.id })
    .populate("user", "fullName phone email")
    .sort({ createdAt: -1 });
  send(res, { items });
});
