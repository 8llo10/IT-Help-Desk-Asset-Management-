// src/routes/dashboard.routes.ts

import { Router } from "express";

import {
    stats,
    recentTickets,
} from "../controllers/dashboard.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    authorize,
} from "../middleware/role.middleware.js";

const router = Router();

router.get(
    "/stats",
    authenticate,
    authorize("ADMIN", "TECHNICIAN"),
    stats
);

router.get(
    "/recent-tickets",
    authenticate,
    authorize("ADMIN", "TECHNICIAN"),
    recentTickets
);

export default router;