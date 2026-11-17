import { GalleryImage } from "../models/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";

export const getGallery = asyncHandler(async (req, res) => {
  const items = await GalleryImage.find({ isActive: true }).sort({
    order: 1,
    createdAt: 1,
  });
  send(res, { items });
});

export const getGalleryById = asyncHandler(async (req, res) => {
  const item = await GalleryImage.findById(req.params.id);
  if (!item) throw new AppError("Gallery image not found.", 404);
  send(res, { item });
});

export const postGallery = asyncHandler(async (req, res) => {
  const { url, caption = "", tall = false, order = 0, isActive = true } = req.body;
  if (!url || !String(url).trim()) throw new AppError("Image URL is required.", 400);

  const item = await GalleryImage.create({
    url: String(url).trim(),
    caption: String(caption).trim(),
    tall: Boolean(tall),
    order: Number(order) || 0,
    isActive: Boolean(isActive),
  });
  send(res, { item }, 201);
});

export const patchGalleryById = asyncHandler(async (req, res) => {
  const allowed = ["url", "caption", "tall", "order", "isActive"];
  const updates = Object.fromEntries(
    allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]])
  );

  const item = await GalleryImage.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new AppError("Gallery image not found.", 404);
  send(res, { item });
});

export const deleteGalleryById = asyncHandler(async (req, res) => {
  const item = await GalleryImage.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError("Gallery image not found.", 404);
  send(res, null, 200, "Gallery image deleted.");
});
