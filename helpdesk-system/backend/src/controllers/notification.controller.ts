import type { Response } from "express";

import type {
    AuthRequest,
} from "../middleware/auth.middleware.js";

import {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notification.service.js";

/**
 * =========================================================
 * GET USER NOTIFICATIONS
 * =========================================================
 */

export const getNotifications = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const notifications =
            await getUserNotifications(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            data: {
                notifications,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * =========================================================
 * GET UNREAD COUNT
 * =========================================================
 */

export const getUnreadCount = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const count =
            await getUnreadNotificationCount(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            data: {
                count,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * =========================================================
 * MARK ONE NOTIFICATION AS READ
 * =========================================================
 */

export const markAsRead = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const notificationId =
            Number(req.params.id);

        if (
            Number.isNaN(notificationId) ||
            notificationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification id",
            });
        }

        const notification =
            await markNotificationAsRead(
                notificationId,
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Notification marked as read",
            data: {
                notification,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "NOTIFICATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * =========================================================
 * MARK ALL NOTIFICATIONS AS READ
 * =========================================================
 */

export const markAllAsRead = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const result =
            await markAllNotificationsAsRead(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            message:
                "All notifications marked as read",
            data: {
                updatedCount: result.count,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};