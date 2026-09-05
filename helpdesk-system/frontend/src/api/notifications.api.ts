import api from "./client";

export const getNotifications = () => {
    return api.get(
        "/notifications"
    );
};

export const getUnreadCount = () => {
    return api.get(
        "/notifications/unread-count"
    );
};

export const markNotificationAsRead = (
    notificationId: number
) => {
    return api.patch(
        `/notifications/${notificationId}/read`
    );
};

export const markAllNotificationsAsRead =
    () => {
        return api.patch(
            "/notifications/read-all"
        );
    };