import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const locationSchema = new Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, required: true, trim: true },
    type: { type: String, enum: ["division", "district", "upazila"], required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Location", default: null },
    path: { type: String, required: true, unique: true, lowercase: true, trim: true },
    code: { type: String, trim: true, default: undefined },
    isActive: { type: Boolean, default: true },
  },
  opts,
);

const Location = model("Location", locationSchema);
export { Location };
export default Location;
