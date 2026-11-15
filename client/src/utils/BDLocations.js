/*
 * Division -> District -> Upazila.
 * This is a starter subset so the cascading filter works out of the box.
 * Replace it with the full dataset (64 districts, 490+ upazilas) from your
 * API or a package such as "bangladesh-geocode" and keep the same shape.
 */
export const bdLocations = {
    Dhaka: {
        Dhaka: ["Khilkhet", "Uttara", "Mirpur", "Dhanmondi", "Savar"],
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