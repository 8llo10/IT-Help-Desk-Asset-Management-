import { Router } from "express";

import {
    create,
    getAll,
    getOne,
    patch,
} from "../controllers/department.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/* =========================================================
   ALL DEPARTMENT ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   GET DEPARTMENTS
   ========================================================= */

router.get(
    "/",
    requirePermission("DEPARTMENT_VIEW"),
    getAll
);

/* =========================================================
   GET DEPARTMENT BY ID
   ========================================================= */

router.get(
    "/:id",
    requirePermission("DEPARTMENT_VIEW"),
    getOne
);

/* =========================================================
   CREATE DEPARTMENT
   ========================================================= */

router.post(
    "/",
    requirePermission("DEPARTMENT_CREATE"),
    create
);

/* =========================================================
   UPDATE DEPARTMENT
   ========================================================= */

router.patch(
    "/:id",
    requirePermission("DEPARTMENT_UPDATE"),
    patch
);

export default router;