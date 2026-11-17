import connectDB from "../config/db.js";
import { User } from "../models/index.js";
import { ROLES, ACCOUNT_STATUS } from "../constants/index.js";

/* Local development only: creates an approved admin so accounts can be reviewed. */
const phone = process.env.ADMIN_PHONE || "01726330069";
const password = process.env.ADMIN_PASSWORD || "shohag344802";

const seed = async () => {
    await connectDB();

    let admin = await User.findOne({ phone });
    if (!admin) {
        admin = new User({
            fullName: "Blood Connect Admin",
            phone,
            email: "admin@bloodconnect.local",
            password,
        });
    }

    admin.role = ROLES.ADMIN;
    admin.accountStatus = ACCOUNT_STATUS.APPROVED;
    admin.phoneVerified = true;
    admin.emailVerified = true;
    admin.password = password;
    await admin.save();

    console.log(`Admin ready: ${phone} / ${password}`);
    console.log("Change ADMIN_PASSWORD before running this in a shared environment.");
    process.exit(0);
};

seed().catch((error) => {
    console.error("Admin seed failed:", error);
    process.exit(1);
});
