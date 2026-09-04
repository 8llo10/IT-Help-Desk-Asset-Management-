import { Router } from "express";

import {
    create,
    getAll,
    getOne,
    patch,
} from "../controllers/branch.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/* =========================================================
   ALL BRANCH ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   VIEW BRANCHES
   ========================================================= */

router.get(
    "/",
    requirePermission("BRANCH_VIEW"),
    getAll
);

router.get(
    "/:id",
    requirePermission("BRANCH_VIEW"),
    getOne
);

/* =========================================================
   CREATE BRANCH
   ========================================================= */

router.post(
    "/",
    requirePermission("BRANCH_CREATE"),
    create
);

/* =========================================================
   UPDATE BRANCH
   ========================================================= */

router.patch(
    "/:id",
    requirePermission("BRANCH_UPDATE"),
    patch
);

export default router;