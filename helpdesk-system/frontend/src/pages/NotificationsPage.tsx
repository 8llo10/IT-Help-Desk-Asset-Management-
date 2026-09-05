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
    Inbox,
    MailOpen,
    Sparkles,
    TicketCheck,
    UserCheck,
    Wrench,
} from "lucide-react";

import type {
    LucideIcon,
} from "lucide-react";

import api from "../api/client";

import "../styles/NotificationsPage.css";

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
    tone: string;
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
                tone: "assignment",
            };

        case "TICKET_REPLY":
            return {
                icon: BellRing,
                label: "Ticket Reply",
                tone: "reply",
            };

        case "TICKET_STATUS_CHANGED":
            return {
                icon: TicketCheck,
                label: "Ticket Update",
                tone: "ticket",
            };

        case "ASSET_ASSIGNED":
            return {
                icon: Wrench,
                label: "Asset Assigned",
                tone: "asset",
            };

        case "ASSET_UNASSIGNED":
            return {
                icon: CircleAlert,
                label: "Asset Unassigned",
                tone: "warning",
            };

        case "ASSET_TRANSFERRED":
            return {
                icon: Wrench,
                label: "Asset Transfer",
                tone: "asset",
            };

        default:
            return {
                icon: Info,
                label: "Notification",
                tone: "default",
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
       LOAD
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
                } catch (
                error: any
                ) {
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
            <div className="notifications-loading">

                <div className="notifications-loading-icon">
                    <BellRing
                        size={25}
                    />
                </div>

                <strong>
                    Loading notifications
                </strong>

                <p>
                    Gathering your latest
                    WASL activity...
                </p>

            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="notifications-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="notifications-hero">

                <div className="notifications-hero-copy">

                    <div className="notifications-eyebrow">
                        <span />
                        WASL ACTIVITY CENTER
                    </div>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay informed about ticket
                        activity, assignments,
                        replies and asset updates
                        across your workspace.
                    </p>

                </div>

                <div className="notifications-hero-status">

                    <div className="notifications-hero-bell">
                        <BellRing
                            size={23}
                        />

                        {unreadCount > 0 && (
                            <span>
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    <div>

                        <span>
                            Inbox Status
                        </span>

                        <strong>
                            {unreadCount > 0
                                ? `${unreadCount} unread`
                                : "All caught up"}
                        </strong>

                    </div>

                </div>

            </section>

            {/* =====================================================
          ERROR
          ===================================================== */}

            {error && (
                <div className="notifications-alert">

                    <CircleAlert
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* =====================================================
          SUMMARY
          ===================================================== */}

            <section className="notifications-summary">

                <article className="notifications-summary-card">

                    <div className="notifications-summary-icon">
                        <Bell
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            Total Activity
                        </span>

                        <strong>
                            {
                                notifications.length
                            }
                        </strong>

                        <small>
                            All notifications
                        </small>

                    </div>

                </article>

                <article className="notifications-summary-card notifications-summary-unread">

                    <div className="notifications-summary-icon">
                        <BellRing
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            Unread
                        </span>

                        <strong>
                            {unreadCount}
                        </strong>

                        <small>
                            Needs attention
                        </small>

                    </div>

                </article>

                <article className="notifications-summary-card notifications-summary-read">

                    <div className="notifications-summary-icon">
                        <CheckCircle2
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            Read
                        </span>

                        <strong>
                            {readCount}
                        </strong>

                        <small>
                            Previously viewed
                        </small>

                    </div>

                </article>

            </section>

            {/* =====================================================
          INBOX
          ===================================================== */}

            <section className="notifications-inbox">

                {/* HEADER */}

                <div className="notifications-inbox-header">

                    <div>

                        <span className="notifications-section-label">
                            ACTIVITY INBOX
                        </span>

                        <h2>
                            Recent Updates
                        </h2>

                        <p>
                            Review system activity
                            associated with your account.
                        </p>

                    </div>

                    <div className="notifications-inbox-count">
                        <Inbox
                            size={15}
                        />

                        {
                            filteredNotifications.length
                        }{" "}
                        items
                    </div>

                </div>

                {/* FILTERS */}

                <div className="notifications-toolbar">

                    <div className="notifications-filters">

                        <button
                            type="button"
                            className={
                                filter === "ALL"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "ALL"
                                )
                            }
                            aria-pressed={
                                filter === "ALL"
                            }
                        >
                            <Bell
                                size={14}
                            />

                            All

                            <span>
                                {
                                    notifications.length
                                }
                            </span>
                        </button>

                        <button
                            type="button"
                            className={
                                filter === "UNREAD"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "UNREAD"
                                )
                            }
                            aria-pressed={
                                filter === "UNREAD"
                            }
                        >
                            <BellRing
                                size={14}
                            />

                            Unread

                            <span>
                                {unreadCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            className={
                                filter === "READ"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "READ"
                                )
                            }
                            aria-pressed={
                                filter === "READ"
                            }
                        >
                            <MailOpen
                                size={14}
                            />

                            Read

                            <span>
                                {readCount}
                            </span>
                        </button>

                    </div>

                    <div className="notifications-toolbar-note">

                        <Sparkles
                            size={14}
                        />

                        Live system activity
                    </div>

                </div>

                {/* ===================================================
            LIST
            =================================================== */}

                <div className="notifications-list">

                    {filteredNotifications.length ===
                        0 ? (
                        <div className="notifications-empty">

                            <div className="notifications-empty-icon">
                                <Bell
                                    size={26}
                                />
                            </div>

                            <h2>
                                {filter === "UNREAD"
                                    ? "You're all caught up"
                                    : "No notifications"}
                            </h2>

                            <p>
                                {filter === "UNREAD"
                                    ? "There are no unread notifications requiring your attention."
                                    : "There are no notifications to display in this view."}
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
                                        className={`notification-item ${isRead
                                                ? "notification-read"
                                                : "notification-unread"
                                            } notification-tone-${meta.tone}`}
                                    >

                                        {/* ICON */}

                                        <div className="notification-icon-wrap">

                                            <div className="notification-icon">
                                                <Icon
                                                    size={19}
                                                />
                                            </div>

                                            {!isRead && (
                                                <span className="notification-unread-dot" />
                                            )}

                                        </div>

                                        {/* CONTENT */}

                                        <div className="notification-content">

                                            <div className="notification-top">

                                                <div className="notification-labels">

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

                                            <p className="notification-message">
                                                {
                                                    notification.message
                                                }
                                            </p>

                                            {/* RELATED */}

                                            {(notification.ticket ||
                                                notification.asset) && (
                                                    <div className="notification-related">

                                                        {notification.ticket && (
                                                            <div className="notification-related-item">

                                                                <div className="notification-related-icon">
                                                                    <TicketCheck
                                                                        size={14}
                                                                    />
                                                                </div>

                                                                <div>

                                                                    <span>
                                                                        Related Ticket
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            notification.ticket
                                                                                .ticketNumber
                                                                        }
                                                                    </strong>

                                                                    {notification.ticket
                                                                        .title && (
                                                                            <p>
                                                                                {
                                                                                    notification.ticket
                                                                                        .title
                                                                                }
                                                                            </p>
                                                                        )}

                                                                </div>

                                                            </div>
                                                        )}

                                                        {notification.asset && (
                                                            <div className="notification-related-item">

                                                                <div className="notification-related-icon">
                                                                    <Wrench
                                                                        size={14}
                                                                    />
                                                                </div>

                                                                <div>

                                                                    <span>
                                                                        Related Asset
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            notification.asset
                                                                                .assetTag
                                                                        }
                                                                    </strong>

                                                                    {notification.asset
                                                                        .type && (
                                                                            <p>
                                                                                {
                                                                                    notification.asset
                                                                                        .type
                                                                                }
                                                                            </p>
                                                                        )}

                                                                </div>

                                                            </div>
                                                        )}

                                                    </div>
                                                )}

                                        </div>

                                        {/* READ INDICATOR */}

                                        <div className="notification-state">

                                            {isRead ? (
                                                <>
                                                    <CheckCircle2
                                                        size={14}
                                                    />

                                                    <span>
                                                        Read
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <BellRing
                                                        size={14}
                                                    />

                                                    <span>
                                                        Unread
                                                    </span>
                                                </>
                                            )}

                                        </div>

                                    </article>
                                );
                            }
                        )
                    )}

                </div>

            </section>

        </div>
    );
}