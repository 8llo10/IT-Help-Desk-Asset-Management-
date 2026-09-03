// src/routes/user.routes.ts

import { Router } from "express";
import {
    getUsers,
    patchUser,
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    getUsers
);

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    patchUser
);

export default router;