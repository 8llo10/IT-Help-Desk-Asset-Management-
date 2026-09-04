import prisma from "../config/prisma.js";

type NotificationType =
    | "TICKET_ASSIGNED"
    | "TICKET_REPLY"
    | "TICKET_STATUS_CHANGED"
    | "TICKET_RESOLVED"
    | "TICKET_CLOSED"
    | "TICKET_REOPENED"
    | "TICKET_ESCALATED"
    | "ASSET_ASSIGNED"
    | "ASSET_UNASSIGNED"
    | "ASSET_TRANSFERRED"
    | "ROLE_CHANGED"
    | "ACCOUNT_ACTIVATED"
    | "ACCOUNT_DEACTIVATED"
    | "SYSTEM";

interface CreateNotificationInput {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: number;
}

/**
 * Create notification
 */
export const createNotification = async (
    data: CreateNotificationInput
) => {
    return prisma.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title.trim(),
            message: data.message.trim(),
            entityType: data.entityType ?? null,
            entityId: data.entityId ?? null,
        },
    });
};

/**
 * Get notifications for one user
 */
export const getUserNotifications = async (
    userId: number
) => {
    return prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationCount = async (
    userId: number
) => {
    return prisma.notification.count({
        where: {
            userId,
            isRead: false,
        },
    });
};

/**
 * Mark one notification as read
 */
export const markNotificationAsRead = async (
    notificationId: number,
    userId: number
) => {
    const notification =
        await prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });

    if (!notification) {
        throw new Error("NOTIFICATION_NOT_FOUND");
    }

    return prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
};

/**
 * Mark all user's notifications as read
 */
export const markAllNotificationsAsRead = async (
    userId: number
) => {
    return prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
};