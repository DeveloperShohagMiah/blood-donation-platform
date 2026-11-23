import { Router } from "express";
import * as controller from "../controllers/users.controller.js";
import { admin, staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", protect, staff, controller.getUsers);
router.post("/users", protect, admin, controller.createUser);
router.patch("/users/:id", protect, admin, controller.patchUsersById);
router.delete("/users/:id", protect, admin, controller.deleteUsersById);
router.patch("/users/:id/approval", protect, staff, controller.patchUsersByIdApproval);
router.patch("/users/:id/role", protect, admin, controller.patchUsersByIdRole);

export default router;
