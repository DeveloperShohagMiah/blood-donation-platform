import connectDB from "../config/db.js";
import { User } from "../models/index.js";
import { ACCOUNT_STATUS } from "../constants/index.js";
import { normalizeBdPhone } from "../controllers/helpers.js";

/* Local development helper: approve a pending user by phone number. */
const phone = normalizeBdPhone(process.argv[2]);
if (!phone) {
    console.error("Usage: npm run approve -- 01XXXXXXXXX");
    process.exit(1);
}

const approve = async () => {
    await connectDB();
    const user = await User.findOne({ phone });
    if (!user) {
        console.error(`No account found for ${phone}. Register first.`);
        process.exit(1);
    }

    user.accountStatus = ACCOUNT_STATUS.APPROVED;
    user.approvedAt = new Date();
    await user.save();

    console.log(`Approved: ${user.fullName} (${phone}) — you can log in now.`);
    process.exit(0);
};

approve().catch((error) => {
    console.error("Approval failed:", error);
    process.exit(1);
});
