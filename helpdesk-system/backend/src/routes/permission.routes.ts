import { Router } from "express";

import {
    create,
    getAll,
    getOne,
    patch,
    remove,
} from "../controllers/permission.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/**
 * GET /api/permissions
 * View all permissions
 */
router.get(
    "/",
    authenticate,
    requirePermission("PERMISSION_VIEW"),
    getAll
);

/**
 * GET /api/permissions/:id
 * View one permission
 */
router.get(
    "/:id",
    authenticate,
    requirePermission("PERMISSION_VIEW"),
    getOne
);

/**
 * POST /api/permissions
 * Create permission
 */
router.post(
    "/",
    authenticate,
    requirePermission("PERMISSION_CREATE"),
    create
);

/**
 * PATCH /api/permissions/:id
 * Update permission
 */
router.patch(
    "/:id",
    authenticate,
    requirePermission("PERMISSION_UPDATE"),
    patch
);

/**
 * DELETE /api/permissions/:id
 * Delete permission
 */
router.delete(
    "/:id",
    authenticate,
    requirePermission("PERMISSION_DELETE"),
    remove
);

export default router;