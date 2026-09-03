// src/routes/category.routes.ts

import { Router } from "express";

import {
    create,
    getAll,
} from "../controllers/category.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get(
    "/",
    authenticate,
    getAll
);

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    create
);

export default router;