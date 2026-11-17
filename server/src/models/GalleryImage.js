import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const galleryImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    caption: { type: String, trim: true, default: "" },
    tall: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  opts,
);

const GalleryImage = model("GalleryImage", galleryImageSchema);
export { GalleryImage };
export default GalleryImage;
