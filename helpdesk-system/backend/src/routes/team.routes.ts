// src/routes/team.routes.ts

import { Router } from "express";

import {
    createTeamController,
    getAllTeamsController,
    getTeamByIdController,
    updateTeamController,
} from "../controllers/team.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/* =========================================================
   ALL TEAM ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   VIEW TEAMS
   ========================================================= */

router.get(
    "/",
    requirePermission("TEAM_VIEW"),
    getAllTeamsController
);

router.get(
    "/:id",
    requirePermission("TEAM_VIEW"),
    getTeamByIdController
);

/* =========================================================
   CREATE TEAM
   ========================================================= */

router.post(
    "/",
    requirePermission("TEAM_CREATE"),
    createTeamController
);

/* =========================================================
   UPDATE TEAM
   ========================================================= */

router.patch(
    "/:id",
    requirePermission("TEAM_UPDATE"),
    updateTeamController
);

export default router;