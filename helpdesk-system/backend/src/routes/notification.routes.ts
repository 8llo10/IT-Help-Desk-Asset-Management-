import { Router } from "express";

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../controllers/notification.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * =========================================================
 * ALL NOTIFICATION ROUTES REQUIRE AUTHENTICATION
 * =========================================================
 */

router.use(authenticate);

/**
 * =========================================================
 * GET CURRENT USER NOTIFICATIONS
 * =========================================================
 */

router.get(
    "/",
    getNotifications
);

/**
 * =========================================================
 * GET UNREAD NOTIFICATION COUNT
 * =========================================================
 */

router.get(
    "/unread-count",
    getUnreadCount
);

/**
 * =========================================================
 * MARK ALL NOTIFICATIONS AS READ
 * =========================================================
 */

router.patch(
    "/read-all",
    markAllAsRead
);

/**
 * =========================================================
 * MARK ONE NOTIFICATION AS READ
 * =========================================================
 */

router.patch(
    "/:id/read",
    markAsRead
);

export default router;