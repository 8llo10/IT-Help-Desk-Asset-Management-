import { Router } from "express";

import {
    create,
    getAll,
    patch,
} from "../controllers/asset.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/* =========================================================
   ALL ASSET ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   VIEW ASSETS
   ========================================================= */

router.get(
    "/",
    requirePermission("ASSET_VIEW"),
    getAll
);

/* =========================================================
   CREATE ASSET
   ========================================================= */

router.post(
    "/",
    requirePermission("ASSET_CREATE"),
    create
);

/* =========================================================
   UPDATE ASSET
   ========================================================= */

router.patch(
    "/:id",
    requirePermission("ASSET_UPDATE"),
    patch
);

export default router;