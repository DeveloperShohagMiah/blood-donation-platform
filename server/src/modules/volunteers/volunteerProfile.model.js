import mongoose from "mongoose";
import { VOLUNTEER_AVAILABILITY } from "../../constants/volunteerProfile.js";

const volunteerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        skills: {
            type: [
                {
                    type: String,
                    trim: true,
                    maxlength: 80,
                },
            ],
            default: [],
        },

        serviceArea: {
            type: String,
            trim: true,
            maxlength: 200,
        },

        availability: {
            type: String,
            enum: Object.values(VOLUNTEER_AVAILABILITY),
            default: VOLUNTEER_AVAILABILITY.FLEXIBLE,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        emergencyContact: {
            name: {
                type: String,
                trim: true,
                maxlength: 100,
            },
            phone: {
                type: String,
                trim: true,
                match: [/^\+[1-9]\d{7,14}$/, "Use a valid international phone number"],
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const VolunteerProfile = mongoose.model("VolunteerProfile", volunteerProfileSchema);

export default VolunteerProfile;
