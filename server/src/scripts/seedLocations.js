import connectDB from "../config/db.js";
import { Location } from "../models/index.js";

/* Tangail-focused location dataset: district -> upazilas -> unions.
   Source: Bangladesh Bureau of Statistics / Wikipedia (109 union parishads). */
const DIVISION = { nameEn: "Dhaka", nameBn: "ঢাকা", path: "dhaka" };
const DISTRICT = { nameEn: "Tangail", nameBn: "টাঙ্গাইল", path: "dhaka/tangail" };

const UPAZILAS = {
    "Basail": {
        bn: "বাসাইল",
        unions: ["Basail", "Fulki", "Habla", "Kanchanpur", "Kaoaljani", "Kashil"],
    },
    "Bhuapur": {
        bn: "ভুয়াপুর",
        unions: ["Arjuna", "Aloa", "Falda", "Gabsara", "Gobindashi", "Nikrail"],
    },
    "Delduar": {
        bn: "দেলদুয়ার",
        unions: ["Atia", "Delduar", "Deoli", "Dubail", "Elasin", "Fazilhati", "Lauhati", "Pathrail"],
    },
    "Dhanbari": {
        bn: "ধনবাড়ী",
        unions: ["Baniajan", "Birtara", "Bolibhadra", "Dhopakhali", "Jodunathpur", "Mushuddi", "Paiska"],
    },
    "Ghatail": {
        bn: "ঘাটাইল",
        unions: [
            "Anehola", "Deulabari", "Deopara", "Dhalapara", "Digalkandi", "Digar", "Ghatail",
            "Jamuria", "Lakherpara", "Lakkhindar", "Rasulpur", "Sagardighi", "Sandhanpur", "Sangrampur",
        ],
    },
    "Gopalpur": {
        bn: "গোপালপুর",
        unions: ["Alamnagar", "Dhopakandi", "Hadira", "Hemnagar", "Jhawail", "Mirzapur", "Nagda Simla"],
    },
    "Kalihati": {
        bn: "কালিহাতি",
        unions: [
            "Balla", "Bangra", "Bir Bashinda", "Dashkia", "Durgapur", "Gohaliabari", "Kok Dohora",
            "Nagbari", "Narandia", "Paikara", "Parkhi", "Salla", "Shahadebpur",
        ],
    },
    "Madhupur": {
        bn: "মধুপুর",
        unions: ["Alokdia", "Arankhola", "Ausnara", "Golabari", "Mirzabari", "Sholakuri"],
    },
    "Mirzapur": {
        bn: "মির্জাপুর",
        unions: [
            "Ajgana", "Anaitara", "Bahuria", "Banail", "Banshtail", "Bhaora", "Bhatgram", "Fatepur",
            "Gorai", "Jamurki", "Latifpur", "Mohera", "Tarafpur", "Warshi",
        ],
    },
    "Nagarpur": {
        bn: "নাগরপুর",
        unions: [
            "Bekra", "Bhadra", "Bharra", "Dhubaria", "Duptiair", "Gayhata", "Mamudnagar", "Mokna",
            "Nagarpur", "Pakutia", "Sahabatpur", "Salimabad",
        ],
    },
    "Sakhipur": {
        bn: "সাখীপুর",
        unions: [
            "Baheratoil", "Dariapur", "Gazaria", "Hatibandha", "Jadabpur", "Kakrajan", "Kalia",
            "Kalmegha", "Borochawna", "Hateya Razabari",
        ],
    },
    "Tangail Sadar": {
        bn: "টাঙ্গাইল সদর",
        unions: [
            "Baghil", "Danya", "Gala", "Gharinda", "Hugra", "Karatia", "Katuli", "Kakua", "Magra",
            "Mahamudnagar", "Porabari", "Silimpur",
        ],
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
        { $set: payload, $setOnInsert: { path } },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

const seed = async () => {
    await connectDB();

    // Fresh Tangail-only tree — remove any legacy divisions/districts/upazilas.
    await Location.deleteMany({});

    const division = await upsert(DIVISION.path, {
        nameEn: DIVISION.nameEn,
        nameBn: DIVISION.nameBn,
        type: "division",
        parent: null,
        code: "BD-DH",
    });

    const district = await upsert(DISTRICT.path, {
        nameEn: DISTRICT.nameEn,
        nameBn: DISTRICT.nameBn,
        type: "district",
        parent: division._id,
        code: "BD-63",
    });

    let upazilaCount = 0;
    let unionCount = 0;

    for (const [name, data] of Object.entries(UPAZILAS)) {
        const path = `${DISTRICT.path}/${slug(name)}`;
        const upazila = await upsert(path, {
            nameEn: name,
            nameBn: data.bn,
            type: "upazila",
            parent: district._id,
        });
        upazilaCount += 1;

        for (const union of data.unions) {
            await upsert(`${path}/${slug(union)}`, {
                nameEn: union,
                nameBn: union, // editable from the admin location manager
                type: "union",
                parent: upazila._id,
            });
            unionCount += 1;
        }
    }

    console.log(
        `Tangail seeded: 1 division, 1 district, ${upazilaCount} upazilas, ${unionCount} unions.`
    );
    process.exit(0);
};

seed().catch((error) => {
    console.error("Tangail seed failed:", error);
    process.exit(1);
});
