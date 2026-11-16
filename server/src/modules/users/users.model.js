
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { USER_ROLES, ACCOUNT_STATUS } from "../../constants/roles.js";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
            match: [/^\+[1-9]\d{7,14}$/, "Use a valid international phone number"],
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: undefined,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },

        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.USER,
            required: true,
        },

        accountStatus: {
            type: String,
            enum: Object.values(ACCOUNT_STATUS),
            default: ACCOUNT_STATUS.PENDING,
        },

        phoneVerified: {
            type: Boolean,
            default: false,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        approvedAt: {
            type: Date,
            default: null,
        },

        rejectionReason: {
            type: String,
            default: null,
            maxlength: 500,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Unique email index, but only when an email exists.
userSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: {
            email: { $type: "string" },
        },
    }
);

// Hash password before saving.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare entered password with hashed password.
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
