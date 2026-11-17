import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, ACCOUNT_STATUS } from "../constants/index.js";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    phone: { type: String, required: true, unique: true, trim: true, match: /^\+[1-9]\d{7,14}$/ },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.PENDING,
    },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, maxlength: 500, default: "" },
    lastLoginAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  opts,
);

// Hash the password before storing it, and keep it hashed on updates.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = model("User", userSchema);
export { User };
export default User;
