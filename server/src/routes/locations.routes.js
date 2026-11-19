import { Router } from "express";
import * as controller from "../controllers/locations.controller.js";
import { admin } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";
import { Location } from "../models/index.js";
import { deleteOne, updateOne } from "../controllers/adminCrud.controller.js";

const router = Router();

router.get("/locations", controller.getLocations);
router.get("/locations/tree", controller.getTangailTree);
router.get("/locations/:id", controller.getLocationById);
router.post("/locations", protect, admin, controller.postLocations);
router.post("/locations/seed-tangail", protect, admin, controller.postLocationsSeedTangail);
router.patch(
  "/locations/:id",
  protect,
  admin,
  updateOne(Location, ["nameEn", "nameBn", "type", "parent", "path", "code", "isActive"])
);
router.delete("/locations/:id", protect, admin, deleteOne(Location));

export default router;
