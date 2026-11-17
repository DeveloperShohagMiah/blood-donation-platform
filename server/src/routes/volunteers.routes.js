import { Router } from "express";
import * as controller from "../controllers/volunteers.controller.js";
import { admin, staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";
import { VolunteerProfile } from "../models/index.js";
import { deleteOne, updateOne } from "../controllers/adminCrud.controller.js";

const router = Router();

router.get("/volunteers/me", protect, controller.getVolunteersMe);
router.put("/volunteers/me", protect, controller.putVolunteersMe);
router.get("/volunteers", protect, staff, controller.getVolunteers);
router.get("/volunteers/:id", protect, staff, controller.getVolunteerById);
router.patch(
  "/volunteers/:id",
  protect,
  admin,
  updateOne(VolunteerProfile, ["serviceAreas", "availability", "maxActiveAssignments"])
);
router.delete("/volunteers/:id", protect, admin, deleteOne(VolunteerProfile));

export default router;
