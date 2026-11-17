import { Campaign } from "../models/index.js";
import { ROLES } from "../constants/index.js";
import { AppError, asyncHandler, send, pick } from "../utils/http.js";
import { audit } from "./helpers.js";

export const getCampaigns = asyncHandler(async (req, res) => {
  const filter =
    req.user?.role && [ROLES.ADMIN, ROLES.MODERATOR].includes(req.user.role)
      ? {}
      : { status: "published" };
  const items = await Campaign.find(filter).sort({ startAt: 1 });
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
    ]),
    { new: true, runValidators: true },
  );
  if (!item) throw new AppError("Campaign not found.", 404);
  await audit(req, "campaign.updated", "Campaign", item._id);
  send(res, { item });
});
