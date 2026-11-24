import { Router } from "express";
import * as controller from "../controllers/donors.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { admin, staff } from "./route-guards.js";
import { DonorProfile } from "../models/index.js";
import { deleteOne, updateOne } from "../controllers/adminCrud.controller.js";

const router = Router();

router.put("/donors/me", protect, controller.putDonorsMe);
router.get("/donors/me", protect, controller.getDonorsMe);
router.get("/donors/search", controller.getDonorsSearch);
router.get("/donors", protect, staff, controller.getDonorsAdmin);
router.get("/donors/:id", protect, staff, controller.getDonorById);
router.patch(
  "/donors/:id",
  protect,
  admin,
  updateOne(DonorProfile, [
    "bloodGroup",
    "lastDonationDate",
    "availability",
    "division",
    "district",
    "upazila",
    "area",
    "lat",
    "lng",
    "isPubliclyListed",
    "allowContactRequests",
  ])
);
router.delete("/donors/:id", protect, admin, deleteOne(DonorProfile));

export default router;
