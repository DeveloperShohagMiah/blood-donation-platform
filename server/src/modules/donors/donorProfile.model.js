import mongoose from "mongoose";
import { BLOOD_GROUPS, GENDER_OPTIONS } from "../../constants/donorProfile.js";

const donorProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        bloodGroup: {
            type: String,
            enum: Object.values(BLOOD_GROUPS),
            required: true,
        },

        dateOfBirth: {
            type: Date,
            required: true,
        },

        gender: {
            type: String,
            enum: Object.values(GENDER_OPTIONS),
            default: GENDER_OPTIONS.PREFER_NOT_TO_SAY,
        },

        address: {
            type: String,
            trim: true,
            maxlength: 300,
        },

        city: {
            type: String,
            trim: true,
            maxlength: 100,
        },

        lastDonationDate: {
            type: Date,
            default: null,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const DonorProfile = mongoose.model("DonorProfile", donorProfileSchema);

export default DonorProfile;
