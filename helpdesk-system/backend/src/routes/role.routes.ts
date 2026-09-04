import { Router } from "express";

import {
    create,
    getAll,
    getOne,
    patch,
    assignPermission,
    removePermission,
    assignToUser,
    removeFromUser,
    getUserAccess,
} from "../controllers/role.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requirePermission,
} from "../middleware/permission.middleware.js";

const router = Router();

/* =========================================================
   VIEW ROLES
   ========================================================= */

router.get(
    "/",
    authenticate,
    requirePermission("ROLE_VIEW"),
    getAll
);

router.get(
    "/:id",
    authenticate,
    requirePermission("ROLE_VIEW"),
    getOne
);

/* =========================================================
   CREATE / UPDATE ROLES
   ========================================================= */

router.post(
    "/",
    authenticate,
    requirePermission("ROLE_CREATE"),
    create
);

router.patch(
    "/:id",
    authenticate,
    requirePermission("ROLE_UPDATE"),
    patch
);

/* =========================================================
   ROLE PERMISSIONS
   ========================================================= */

router.post(
    "/:id/permissions",
    authenticate,
    requirePermission(
        "ROLE_PERMISSION_MANAGE"
    ),
    assignPermission
);

router.delete(
    "/:id/permissions/:permissionId",
    authenticate,
    requirePermission(
        "ROLE_PERMISSION_MANAGE"
    ),
    removePermission
);

/* =========================================================
   USER ROLE ASSIGNMENTS
   ========================================================= */

router.post(
    "/:id/users",
    authenticate,
    requirePermission(
        "USER_ROLE_MANAGE"
    ),
    assignToUser
);

router.delete(
    "/:id/users/:userId",
    authenticate,
    requirePermission(
        "USER_ROLE_MANAGE"
    ),
    removeFromUser
);

/* =========================================================
   USER EFFECTIVE ACCESS
   ========================================================= */

router.get(
    "/users/:userId/access",
    authenticate,
    requirePermission("ROLE_VIEW"),
    getUserAccess
);

export default router;