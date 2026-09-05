import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    CircleDot,
    Clock3,
    Filter,
    Inbox,
    ListFilter,
    Plus,
    Search,
    SlidersHorizontal,
    Sparkles,
    Tag,
    TicketCheck,
    User,
    UserCheck,
    Wrench,
    X,
} from "lucide-react";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

import "../styles/TicketsPage.css";

type TicketPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

type TicketStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

interface Ticket {
    id: number;
    ticketNumber: string;

    title: string;
    description: string;

    priority: TicketPriority;
    status: TicketStatus;

    slaDueAt?: string | null;
    createdAt: string;

    category?: {
        id: number;
        name: string;
    } | null;

    createdBy?: {
        id: number;
        fullName: string;
        email: string;
    } | null;

    assignedTo?: {
        id: number;
        fullName: string;
        email: string;
    } | null;

    asset?: {
        id: number;
        assetTag: string;
        type: string;
    } | null;
}

function formatStatus(
    status: TicketStatus
) {
    switch (status) {
        case "OPEN":
            return "Open";

        case "IN_PROGRESS":
            return "In Progress";

        case "RESOLVED":
            return "Resolved";

        case "CLOSED":
            return "Closed";
    }
}

function formatPriority(
    priority: TicketPriority
) {
    return (
        priority.charAt(0) +
        priority
            .slice(1)
            .toLowerCase()
    );
}

function isTicketOverdue(
    ticket: Ticket
) {
    if (!ticket.slaDueAt) {
        return false;
    }

    if (
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED"
    ) {
        return false;
    }

    return (
        new Date(
            ticket.slaDueAt
        ).getTime() <
        Date.now()
    );
}

export default function TicketsPage() {
    const { user } =
        useAuth();

    const [
        tickets,
        setTickets,
    ] =
        useState<Ticket[]>([]);

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
        search,
        setSearch,
    ] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState("");

    const [
        priorityFilter,
        setPriorityFilter,
    ] =
        useState("");

    /* =====================================================
       FETCH
       ===================================================== */

    const fetchTickets =
        async () => {
            try {
                setError("");

                const response =
                    await api.get(
                        "/tickets"
                    );

                const data =
                    response.data
                        ?.data
                        ?.tickets ??
                    response.data
                        ?.data ??
                    [];

                setTickets(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (
            error: any
            ) {
                setError(
                    error.response
                        ?.data
                        ?.message ??
                    "Failed to load tickets"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchTickets();
    }, []);

    /* =====================================================
       FILTERS
       ===================================================== */

    const filteredTickets =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return tickets.filter(
                (ticket) => {
                    const matchesSearch =
                        !query ||
                        ticket.ticketNumber
                            .toLowerCase()
                            .includes(query) ||
                        ticket.title
                            .toLowerCase()
                            .includes(query) ||
                        ticket.description
                            .toLowerCase()
                            .includes(query) ||
                        ticket.createdBy
                            ?.fullName
                            .toLowerCase()
                            .includes(query) ||
                        ticket.assignedTo
                            ?.fullName
                            .toLowerCase()
                            .includes(query);

                    const matchesStatus =
                        !statusFilter ||
                        ticket.status ===
                        statusFilter;

                    const matchesPriority =
                        !priorityFilter ||
                        ticket.priority ===
                        priorityFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority
                    );
                }
            );
        }, [
            tickets,
            search,
            statusFilter,
            priorityFilter,
        ]);

    /* =====================================================
       REAL STATS
       ===================================================== */

    const stats =
        useMemo(() => {
            const open =
                tickets.filter(
                    (ticket) =>
                        ticket.status ===
                        "OPEN"
                ).length;

            const inProgress =
                tickets.filter(
                    (ticket) =>
                        ticket.status ===
                        "IN_PROGRESS"
                ).length;

            const resolved =
                tickets.filter(
                    (ticket) =>
                        ticket.status ===
                        "RESOLVED"
                ).length;

            const overdue =
                tickets.filter(
                    isTicketOverdue
                ).length;

            return {
                open,
                inProgress,
                resolved,
                overdue,
            };
        }, [tickets]);

    const hasFilters =
        Boolean(
            search ||
            statusFilter ||
            priorityFilter
        );

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setPriorityFilter("");
    };

    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {
        return (
            <div className="tickets-loading">

                <div className="tickets-loading-icon">
                    <TicketCheck size={25} />
                </div>

                <strong>
                    Loading service desk
                </strong>

                <p>
                    Preparing your ticket queue...
                </p>

            </div>
        );
    }

    return (
        <div className="tickets-page">

            {/* =================================================
                HERO
                ================================================= */}

            <section className="tickets-hero">

                <div className="tickets-hero-copy">

                    <div className="tickets-eyebrow">
                        <Sparkles size={12} />

                        SERVICE DESK
                    </div>

                    <h1>
                        Support Tickets
                    </h1>

                    <p>
                        Track requests, ownership,
                        priority and support progress
                        from one operational queue.
                    </p>

                    <div className="tickets-hero-meta">

                        <span>
                            <Inbox size={13} />

                            {tickets.length} Total
                        </span>

                        <span>
                            <CircleDot size={13} />

                            {stats.open} Open
                        </span>

                    </div>

                </div>

                {(user?.role ===
                    "EMPLOYEE" ||
                    user?.role ===
                    "ADMIN") && (
                        <Link
                            to="/tickets/new"
                            className="tickets-new-button"
                        >
                            <Plus size={16} />

                            New Ticket
                        </Link>
                    )}

            </section>

            {/* =================================================
                ERROR
                ================================================= */}

            {error && (
                <div className="tickets-error">

                    <AlertTriangle
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* =================================================
                STATS
                ================================================= */}

            <section className="tickets-stats">

                <article className="tickets-stat-card">

                    <div className="tickets-stat-icon open">
                        <Inbox size={18} />
                    </div>

                    <div>
                        <span>
                            Open Queue
                        </span>

                        <strong>
                            {stats.open}
                        </strong>

                        <p>
                            Awaiting progress
                        </p>
                    </div>

                </article>

                <article className="tickets-stat-card">

                    <div className="tickets-stat-icon progress">
                        <Wrench size={18} />
                    </div>

                    <div>
                        <span>
                            In Progress
                        </span>

                        <strong>
                            {stats.inProgress}
                        </strong>

                        <p>
                            Currently being handled
                        </p>
                    </div>

                </article>

                <article className="tickets-stat-card">

                    <div className="tickets-stat-icon resolved">
                        <CheckCircle2 size={18} />
                    </div>

                    <div>
                        <span>
                            Resolved
                        </span>

                        <strong>
                            {stats.resolved}
                        </strong>

                        <p>
                            Requests resolved
                        </p>
                    </div>

                </article>

                <article
                    className={`tickets-stat-card ${stats.overdue > 0
                            ? "has-overdue"
                            : ""
                        }`}
                >

                    <div className="tickets-stat-icon overdue">
                        <Clock3 size={18} />
                    </div>

                    <div>
                        <span>
                            SLA Overdue
                        </span>

                        <strong>
                            {stats.overdue}
                        </strong>

                        <p>
                            Active overdue tickets
                        </p>
                    </div>

                </article>

            </section>

            {/* =================================================
                QUEUE
                ================================================= */}

            <section className="tickets-queue-card">

                <div className="tickets-queue-header">

                    <div>

                        <span className="tickets-section-label">
                            TICKET QUEUE
                        </span>

                        <h2>
                            Service Desk Queue
                        </h2>

                        <p>
                            Search and filter support
                            requests by status or priority.
                        </p>

                    </div>

                    <div className="tickets-result-count">

                        <ListFilter
                            size={14}
                        />

                        <strong>
                            {
                                filteredTickets
                                    .length
                            }
                        </strong>

                        <span>
                            results
                        </span>

                    </div>

                </div>

                {/* =============================================
                    FILTERS
                    ============================================= */}

                <div className="tickets-toolbar">

                    <div className="tickets-search">

                        <Search
                            size={16}
                        />

                        <input
                            type="search"
                            placeholder="Search ticket, title, employee or technician..."
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                <X
                                    size={14}
                                />
                            </button>
                        )}

                    </div>

                    <div className="tickets-filter-select">

                        <Filter
                            size={14}
                        />

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setStatusFilter(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="OPEN">
                                Open
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="RESOLVED">
                                Resolved
                            </option>

                            <option value="CLOSED">
                                Closed
                            </option>

                        </select>

                    </div>

                    <div className="tickets-filter-select">

                        <SlidersHorizontal
                            size={14}
                        />

                        <select
                            value={
                                priorityFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setPriorityFilter(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option value="">
                                All Priorities
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>

                        </select>

                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            className="tickets-clear-filters"
                            onClick={
                                clearFilters
                            }
                        >
                            <X size={13} />

                            Clear
                        </button>
                    )}

                </div>

                {/* =============================================
                    EMPTY
                    ============================================= */}

                {filteredTickets.length ===
                    0 ? (
                    <div className="tickets-empty">

                        <div className="tickets-empty-icon">
                            <Search
                                size={23}
                            />
                        </div>

                        <strong>
                            No tickets found
                        </strong>

                        <p>
                            {hasFilters
                                ? "No support requests match the current filters."
                                : "There are no support tickets to display."}
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>
                ) : (
                    <div className="tickets-table-shell">

                        <table className="tickets-table">

                            <thead>
                                <tr>
                                    <th>
                                        Ticket
                                    </th>

                                    <th>
                                        Request
                                    </th>

                                    <th>
                                        Priority
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Requester
                                    </th>

                                    <th>
                                        Technician
                                    </th>

                                    <th>
                                        SLA
                                    </th>

                                    <th aria-label="Open ticket" />
                                </tr>
                            </thead>

                            <tbody>

                                {filteredTickets.map(
                                    (
                                        ticket
                                    ) => {
                                        const overdue =
                                            isTicketOverdue(
                                                ticket
                                            );

                                        return (
                                            <tr
                                                key={
                                                    ticket.id
                                                }
                                                className={
                                                    overdue
                                                        ? "ticket-row-overdue"
                                                        : ""
                                                }
                                            >

                                                {/* TICKET */}

                                                <td>

                                                    <Link
                                                        to={`/tickets/${ticket.id}`}
                                                        className="tickets-ticket-number"
                                                    >
                                                        {
                                                            ticket.ticketNumber
                                                        }
                                                    </Link>

                                                    <span className="tickets-ticket-date">
                                                        {new Date(
                                                            ticket.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>

                                                </td>

                                                {/* REQUEST */}

                                                <td>

                                                    <div className="tickets-request">

                                                        <strong>
                                                            {
                                                                ticket.title
                                                            }
                                                        </strong>

                                                        <div>

                                                            {ticket.category && (
                                                                <span>
                                                                    <Tag
                                                                        size={11}
                                                                    />

                                                                    {
                                                                        ticket
                                                                            .category
                                                                            .name
                                                                    }
                                                                </span>
                                                            )}

                                                            {ticket.asset && (
                                                                <span>
                                                                    {
                                                                        ticket
                                                                            .asset
                                                                            .assetTag
                                                                    }
                                                                </span>
                                                            )}

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* PRIORITY */}

                                                <td>

                                                    <span
                                                        className={`tickets-priority priority-${ticket.priority.toLowerCase()}`}
                                                    >
                                                        <AlertTriangle
                                                            size={11}
                                                        />

                                                        {formatPriority(
                                                            ticket.priority
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`tickets-status status-${ticket.status.toLowerCase()}`}
                                                    >
                                                        <CircleDot
                                                            size={10}
                                                        />

                                                        {formatStatus(
                                                            ticket.status
                                                        )}
                                                    </span>

                                                </td>

                                                {/* REQUESTER */}

                                                <td>

                                                    <div className="tickets-person">

                                                        <div className="tickets-person-icon">
                                                            <User
                                                                size={13}
                                                            />
                                                        </div>

                                                        <span>
                                                            {ticket.createdBy
                                                                ?.fullName ??
                                                                "—"}
                                                        </span>

                                                    </div>

                                                </td>

                                                {/* TECHNICIAN */}

                                                <td>

                                                    <div className="tickets-person">

                                                        <div
                                                            className={`tickets-person-icon ${ticket.assignedTo
                                                                    ? "assigned"
                                                                    : ""
                                                                }`}
                                                        >
                                                            <UserCheck
                                                                size={13}
                                                            />
                                                        </div>

                                                        <span>
                                                            {ticket.assignedTo
                                                                ?.fullName ??
                                                                "Unassigned"}
                                                        </span>

                                                    </div>

                                                </td>

                                                {/* SLA */}

                                                <td>

                                                    {ticket.slaDueAt ? (
                                                        <div
                                                            className={`tickets-sla ${overdue
                                                                    ? "overdue"
                                                                    : ""
                                                                }`}
                                                        >
                                                            {overdue ? (
                                                                <AlertTriangle
                                                                    size={12}
                                                                />
                                                            ) : (
                                                                <Clock3
                                                                    size={12}
                                                                />
                                                            )}

                                                            <div>
                                                                <strong>
                                                                    {overdue
                                                                        ? "Overdue"
                                                                        : "Due"}
                                                                </strong>

                                                                <span>
                                                                    {new Date(
                                                                        ticket.slaDueAt
                                                                    ).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="tickets-no-sla">
                                                            —
                                                        </span>
                                                    )}

                                                </td>

                                                {/* OPEN */}

                                                <td>

                                                    <Link
                                                        to={`/tickets/${ticket.id}`}
                                                        className="tickets-open-ticket"
                                                        aria-label={`Open ${ticket.ticketNumber}`}
                                                    >
                                                        <ChevronRight
                                                            size={16}
                                                        />
                                                    </Link>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
}