import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Bell,
    BellRing,
    CheckCircle2,
    CircleAlert,
    Info,
    TicketCheck,
    UserCheck,
    Wrench,
} from "lucide-react";

import type {
    LucideIcon,
} from "lucide-react";

import api from "../api/client";

type NotificationType =
    | "TICKET_ASSIGNED"
    | "TICKET_REPLY"
    | "TICKET_STATUS_CHANGED"
    | "ASSET_ASSIGNED"
    | "ASSET_UNASSIGNED"
    | "ASSET_TRANSFERRED"
    | string;

interface Notification {
    id: number;

    type?: NotificationType;

    title?: string;
    message: string;

    isRead?: boolean;
    readAt?: string | null;

    createdAt: string;

    ticketId?: number | null;
    assetId?: number | null;

    ticket?: {
        id: number;
        ticketNumber: string;
        title?: string;
    } | null;

    asset?: {
        id: number;
        assetTag: string;
        type?: string;
    } | null;
}

interface NotificationMeta {
    icon: LucideIcon;
    label: string;
}

/* =========================================================
   HELPERS
   ========================================================= */

const getNotificationMeta = (
    type?: NotificationType
): NotificationMeta => {
    switch (type) {
        case "TICKET_ASSIGNED":
            return {
                icon: UserCheck,
                label: "Ticket Assignment",
            };

        case "TICKET_REPLY":
            return {
                icon: BellRing,
                label: "Ticket Reply",
            };

        case "TICKET_STATUS_CHANGED":
            return {
                icon: TicketCheck,
                label: "Ticket Update",
            };

        case "ASSET_ASSIGNED":
            return {
                icon: Wrench,
                label: "Asset Assigned",
            };

        case "ASSET_UNASSIGNED":
            return {
                icon: CircleAlert,
                label: "Asset Unassigned",
            };

        case "ASSET_TRANSFERRED":
            return {
                icon: Wrench,
                label: "Asset Transfer",
            };

        default:
            return {
                icon: Info,
                label: "Notification",
            };
    }
};

const formatDate = (
    value: string
) => {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString();
};

/* =========================================================
   PAGE
   ========================================================= */

export default function NotificationsPage() {
    const [
        notifications,
        setNotifications,
    ] =
        useState<Notification[]>([]);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        error,
        setError,
    ] =
        useState("");

    const [
        filter,
        setFilter,
    ] =
        useState<
            "ALL" | "UNREAD" | "READ"
        >("ALL");

    /* =========================================================
       LOAD NOTIFICATIONS
       ========================================================= */

    useEffect(() => {
        const fetchNotifications =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const response =
                        await api.get(
                            "/notifications"
                        );

                    const data =
                        response.data?.data
                            ?.notifications ??
                        response.data?.data ??
                        [];

                    setNotifications(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                } catch (error: any) {
                    setError(
                        error.response?.data
                            ?.message ??
                        "Failed to load notifications"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void fetchNotifications();
    }, []);

    /* =========================================================
       COUNTS
       ========================================================= */

    const unreadCount =
        useMemo(() => {
            return notifications.filter(
                (notification) =>
                    !notification.isRead &&
                    !notification.readAt
            ).length;
        }, [notifications]);

    const readCount =
        notifications.length -
        unreadCount;

    /* =========================================================
       FILTER
       ========================================================= */

    const filteredNotifications =
        useMemo(() => {
            if (
                filter === "ALL"
            ) {
                return notifications;
            }

            if (
                filter === "UNREAD"
            ) {
                return notifications.filter(
                    (notification) =>
                        !notification.isRead &&
                        !notification.readAt
                );
            }

            return notifications.filter(
                (notification) =>
                    notification.isRead ||
                    Boolean(
                        notification.readAt
                    )
            );
        }, [
            notifications,
            filter,
        ]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div>
                <Bell />

                <p>
                    Loading notifications...
                </p>
            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="notifications-page">

            {/* HEADER */}

            <section className="notifications-header">
                <div>
                    <p>
                        WASL Notification Center
                    </p>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay updated on ticket
                        activity, assignments and
                        asset changes.
                    </p>
                </div>

                <div>
                    <BellRing
                        size={22}
                    />

                    <span>
                        {unreadCount} unread
                    </span>
                </div>
            </section>

            {/* ERROR */}

            {error && (
                <div>
                    <CircleAlert
                        size={18}
                    />

                    <p>
                        {error}
                    </p>
                </div>
            )}

            {/* SUMMARY */}

            <section className="notifications-summary">

                <article>
                    <Bell
                        size={20}
                    />

                    <div>
                        <span>
                            Total
                        </span>

                        <strong>
                            {
                                notifications.length
                            }
                        </strong>
                    </div>
                </article>

                <article>
                    <BellRing
                        size={20}
                    />

                    <div>
                        <span>
                            Unread
                        </span>

                        <strong>
                            {unreadCount}
                        </strong>
                    </div>
                </article>

                <article>
                    <CheckCircle2
                        size={20}
                    />

                    <div>
                        <span>
                            Read
                        </span>

                        <strong>
                            {readCount}
                        </strong>
                    </div>
                </article>

            </section>

            {/* FILTERS */}

            <section className="notifications-filters">

                <button
                    type="button"
                    onClick={() =>
                        setFilter("ALL")
                    }
                    aria-pressed={
                        filter === "ALL"
                    }
                >
                    All
                    {" "}
                    ({notifications.length})
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setFilter("UNREAD")
                    }
                    aria-pressed={
                        filter === "UNREAD"
                    }
                >
                    Unread
                    {" "}
                    ({unreadCount})
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setFilter("READ")
                    }
                    aria-pressed={
                        filter === "READ"
                    }
                >
                    Read
                    {" "}
                    ({readCount})
                </button>

            </section>

            {/* NOTIFICATION LIST */}

            <section className="notifications-list">

                {filteredNotifications.length ===
                    0 ? (
                    <div className="notifications-empty">
                        <Bell
                            size={34}
                        />

                        <h2>
                            No notifications
                        </h2>

                        <p>
                            {filter === "UNREAD"
                                ? "You're all caught up."
                                : "There are no notifications to display."}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map(
                        (notification) => {
                            const meta =
                                getNotificationMeta(
                                    notification.type
                                );

                            const Icon =
                                meta.icon;

                            const isRead =
                                notification.isRead ||
                                Boolean(
                                    notification.readAt
                                );

                            return (
                                <article
                                    key={
                                        notification.id
                                    }
                                    className={
                                        isRead
                                            ? "notification-item"
                                            : "notification-item notification-unread"
                                    }
                                >

                                    {/* ICON */}

                                    <div className="notification-icon">
                                        <Icon
                                            size={20}
                                        />
                                    </div>

                                    {/* CONTENT */}

                                    <div className="notification-content">

                                        <div className="notification-top">

                                            <div>
                                                <span className="notification-type">
                                                    {
                                                        meta.label
                                                    }
                                                </span>

                                                {!isRead && (
                                                    <span className="notification-new">
                                                        New
                                                    </span>
                                                )}
                                            </div>

                                            <time
                                                dateTime={
                                                    notification.createdAt
                                                }
                                            >
                                                {formatDate(
                                                    notification.createdAt
                                                )}
                                            </time>

                                        </div>

                                        <h3>
                                            {notification.title ??
                                                meta.label}
                                        </h3>

                                        <p>
                                            {
                                                notification.message
                                            }
                                        </p>

                                        {/* RELATED TICKET */}

                                        {notification.ticket && (
                                            <div>
                                                <TicketCheck
                                                    size={15}
                                                />

                                                <span>
                                                    {
                                                        notification.ticket
                                                            .ticketNumber
                                                    }
                                                </span>

                                                {notification.ticket
                                                    .title && (
                                                        <span>
                                                            {" — "}
                                                            {
                                                                notification.ticket
                                                                    .title
                                                            }
                                                        </span>
                                                    )}
                                            </div>
                                        )}

                                        {/* RELATED ASSET */}

                                        {notification.asset && (
                                            <div>
                                                <Wrench
                                                    size={15}
                                                />

                                                <span>
                                                    {
                                                        notification.asset
                                                            .assetTag
                                                    }
                                                </span>

                                                {notification.asset
                                                    .type && (
                                                        <span>
                                                            {" — "}
                                                            {
                                                                notification.asset
                                                                    .type
                                                            }
                                                        </span>
                                                    )}
                                            </div>
                                        )}

                                    </div>

                                </article>
                            );
                        }
                    )
                )}

            </section>

        </div>
    );
}