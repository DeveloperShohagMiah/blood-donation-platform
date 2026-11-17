import { Location } from "../models/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit } from "./helpers.js";

export const getLocations = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.parent) filter.parent = req.query.parent;
  const items = await Location.find(filter)
    .select("nameEn nameBn type parent path code")
    .sort({ nameEn: 1 });
  send(res, { items });
});

export const postLocations = asyncHandler(async (req, res) => {
  const { nameEn, nameBn, type, parent, path, code } = req.body;
  if (!["division", "district", "upazila"].includes(type))
    throw new AppError("Invalid location type.", 400);
  if (type === "division" && parent) throw new AppError("A division cannot have a parent.", 400);
  if (type !== "division") {
    const parentDoc = await Location.findById(parent);
    const expected = type === "district" ? "division" : "district";
    if (!parentDoc || parentDoc.type !== expected)
      throw new AppError(`A ${type} must belong to a ${expected}.`, 400);
  }
  const item = await Location.create({ nameEn, nameBn, type, parent: parent || null, path, code });
  await audit(req, "location.created", "Location", item._id);
  send(res, { item }, 201);
});

export const postLocationsSeedTangail = asyncHandler(async (req, res) => {
  const {
    divisionNameEn = "Dhaka",
    divisionNameBn = "ঢাকা",
    districtNameEn = "Tangail",
    districtNameBn = "টাঙ্গাইল",
    upazilas = [],
  } = req.body;
  let division = await Location.findOne({ path: "dhaka" });
  if (!division)
    division = await Location.create({
      nameEn: divisionNameEn,
      nameBn: divisionNameBn,
      type: "division",
      path: "dhaka",
    });
  let district = await Location.findOne({ path: "dhaka/tangail" });
  if (!district)
    district = await Location.create({
      nameEn: districtNameEn,
      nameBn: districtNameBn,
      type: "district",
      parent: division._id,
      path: "dhaka/tangail",
    });
  const created = [];
  for (const name of upazilas) {
    const slug = String(name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const doc = await Location.findOneAndUpdate(
      { path: `dhaka/tangail/${slug}` },
      {
        $setOnInsert: {
          nameEn: name,
          nameBn: name,
          type: "upazila",
          parent: district._id,
          path: `dhaka/tangail/${slug}`,
        },
      },
      { new: true, upsert: true },
    );
    created.push(doc);
  }
  send(
    res,
    { division, district, upazilas: created },
    201,
    "Tangail location structure seeded. Add Bangla upazila names before public use.",
  );
});
