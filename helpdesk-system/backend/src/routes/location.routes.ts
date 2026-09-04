import { Router } from "express";

import {
    create,
    getAll,
    getOne,
    patch,
} from "../controllers/location.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/* =========================================================
   ALL LOCATION ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   VIEW LOCATIONS
   ========================================================= */

router.get(
    "/",
    requirePermission("LOCATION_VIEW"),
    getAll
);

router.get(
    "/:id",
    requirePermission("LOCATION_VIEW"),
    getOne
);

/* =========================================================
   CREATE LOCATION
   ========================================================= */

router.post(
    "/",
    requirePermission("LOCATION_CREATE"),
    create
);

/* =========================================================
   UPDATE LOCATION
   ========================================================= */

router.patch(
    "/:id",
    requirePermission("LOCATION_UPDATE"),
    patch
);

export default router;