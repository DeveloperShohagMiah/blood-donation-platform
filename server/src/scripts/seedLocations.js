import connectDB from "../config/db.js";
import { Location } from "../models/index.js";

/* Starter subset. Extend this with the full 64-district dataset when needed. */
const DATA = {
    Dhaka: {
        Dhaka: ["Khilkhet", "Uttara", "Mirpur", "Dhanmondi", "Savar"],
        Tangail: [
            "Tangail Sadar",
            "Kalihati",
            "Bhuapur",
            "Gopalpur",
            "Delduar",
            "Ghatail",
            "Madhupur",
            "Sakhipur",
            "Basail",
            "Mirzapur",
        ],
        Gazipur: ["Gazipur Sadar", "Kaliakair", "Tongi"],
        Narayanganj: ["Narayanganj Sadar", "Rupganj"],
    },
    Chattogram: {
        Chattogram: ["Kotwali", "Pahartali", "Hathazari", "Sitakunda"],
        "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria"],
        Cumilla: ["Cumilla Sadar", "Chandina"],
    },
    Rajshahi: {
        Rajshahi: ["Boalia", "Paba"],
        Bogura: ["Bogura Sadar", "Shibganj"],
    },
    Khulna: {
        Khulna: ["Khulna Sadar", "Dumuria"],
        Jashore: ["Jashore Sadar", "Sharsha"],
    },
    Sylhet: {
        Sylhet: ["Sylhet Sadar", "Beanibazar"],
        Moulvibazar: ["Moulvibazar Sadar", "Sreemangal"],
    },
    Barishal: {
        Barishal: ["Barishal Sadar", "Bakerganj"],
        Bhola: ["Bhola Sadar"],
    },
    Rangpur: {
        Rangpur: ["Rangpur Sadar", "Mithapukur"],
        Dinajpur: ["Dinajpur Sadar"],
    },
    Mymensingh: {
        Mymensingh: ["Mymensingh Sadar", "Trishal"],
        Jamalpur: ["Jamalpur Sadar"],
    },
};

const slug = (value) =>
    String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const upsert = (path, payload) =>
    Location.findOneAndUpdate(
        { path },
        { $setOnInsert: { path, ...payload } },
        { returnDocument: "after", upsert: true }
    );

const seed = async () => {
    await connectDB();
    let count = 0;

    for (const [divisionName, districts] of Object.entries(DATA)) {
        const divisionPath = slug(divisionName);
        const division = await upsert(divisionPath, {
            nameEn: divisionName,
            nameBn: divisionName,
            type: "division",
            parent: null,
        });
        count += 1;

        for (const [districtName, upazilas] of Object.entries(districts)) {
            const districtPath = `${divisionPath}/${slug(districtName)}`;
            const district = await upsert(districtPath, {
                nameEn: districtName,
                nameBn: districtName,
                type: "district",
                parent: division._id,
            });
            count += 1;

            for (const upazilaName of upazilas) {
                await upsert(`${districtPath}/${slug(upazilaName)}`, {
                    nameEn: upazilaName,
                    nameBn: upazilaName,
                    type: "upazila",
                    parent: district._id,
                });
                count += 1;
            }
        }
    }

    console.log(`Location seed complete (${count} records processed).`);
    process.exit(0);
};

seed().catch((error) => {
    console.error("Location seed failed:", error);
    process.exit(1);
});
