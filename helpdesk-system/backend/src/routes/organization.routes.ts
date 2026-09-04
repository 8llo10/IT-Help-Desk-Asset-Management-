import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  patch,
} from "../controllers/organization.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

import {
  requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/* =========================================================
   ALL ORGANIZATION ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   VIEW ORGANIZATIONS
   ========================================================= */

router.get(
  "/",
  requirePermission("ORGANIZATION_VIEW"),
  getAll
);

router.get(
  "/:id",
  requirePermission("ORGANIZATION_VIEW"),
  getOne
);

/* =========================================================
   MANAGE ORGANIZATIONS
   ========================================================= */

router.post(
  "/",
  requirePermission("ORGANIZATION_MANAGE"),
  create
);

router.patch(
  "/:id",
  requirePermission("ORGANIZATION_MANAGE"),
  patch
);

export default router;