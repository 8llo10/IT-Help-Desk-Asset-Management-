import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    CircleDot,
    Clock3,
    Gauge,
    Laptop,
    Plus,
    ServerCog,
    ShieldCheck,
    Sparkles,
    TicketCheck,
    Users,
    Wrench,
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

import "../styles/Dashboard.css";

/* =========================================================
   TYPES
   ========================================================= */

interface DashboardStats {
    tickets: {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        critical: number;
        high: number;
        slaBreached: number;
    };

    assets: {
        total: number;
        available: number;
        maintenance: number;
    };

    users: {
        totalActive: number;
    };
}

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

interface RecentTicket {
    id: number;
    ticketNumber: string;
    title: string;

    priority: TicketPriority;
    status: TicketStatus;

    createdAt: string;
    slaDueAt?: string | null;

    category?: {
        id: number;
        name: string;
    } | null;

    createdBy?: {
        id: number;
        fullName: string;
    } | null;

    assignedTo?: {
        id: number;
        fullName: string;
    } | null;
}

/* =========================================================
   PAGE
   ========================================================= */

export default function DashboardPage() {
    const {
        user: currentUser,
    } = useAuth();

    const [
        stats,
        setStats,
    ] =
        useState<DashboardStats | null>(
            null
        );

    const [
        recentTickets,
        setRecentTickets,
    ] =
        useState<RecentTicket[]>([]);

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

    /* =========================================================
       LOAD DASHBOARD
       ========================================================= */

    useEffect(() => {
        const fetchDashboardData =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const [
                        statsResponse,
                        recentTicketsResponse,
                    ] =
                        await Promise.all([
                            api.get(
                                "/dashboard/stats"
                            ),

                            api.get(
                                "/dashboard/recent-tickets"
                            ),
                        ]);

                    const statsData =
                        statsResponse.data?.data;

                    const recentData =
                        recentTicketsResponse
                            .data?.data?.tickets ??
                        recentTicketsResponse
                            .data?.data ??
                        [];

                    setStats(
                        statsData ?? null
                    );

                    setRecentTickets(
                        Array.isArray(
                            recentData
                        )
                            ? recentData
                            : []
                    );
                } catch (error: any) {
                    setError(
                        error.response?.data
                            ?.message ??
                        "Failed to load dashboard"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void fetchDashboardData();
    }, []);

    /* =========================================================
       DATA
       ========================================================= */

    const ticketChartData =
        useMemo(() => {
            if (!stats) {
                return [];
            }

            return [
                {
                    name: "Open",
                    value:
                        stats.tickets.open,
                },
                {
                    name: "In Progress",
                    value:
                        stats.tickets
                            .inProgress,
                },
                {
                    name: "Resolved",
                    value:
                        stats.tickets
                            .resolved,
                },
                {
                    name: "Closed",
                    value:
                        stats.tickets.closed,
                },
            ];
        }, [stats]);

    const priorityChartData =
        useMemo(() => {
            if (!stats) {
                return [];
            }

            const normalTickets =
                Math.max(
                    stats.tickets.total -
                    stats.tickets.high -
                    stats.tickets
                        .critical,
                    0
                );

            return [
                {
                    name: "Normal",
                    value:
                        normalTickets,
                    color: "#E8B92B",
                },
                {
                    name: "High",
                    value:
                        stats.tickets.high,
                    color: "#D98C42",
                },
                {
                    name: "Critical",
                    value:
                        stats.tickets
                            .critical,
                    color: "#C95E63",
                },
            ];
        }, [stats]);

    const assetChartData =
        useMemo(() => {
            if (!stats) {
                return [];
            }

            const inUse =
                Math.max(
                    stats.assets.total -
                    stats.assets
                        .available -
                    stats.assets
                        .maintenance,
                    0
                );

            return [
                {
                    name: "Available",
                    value:
                        stats.assets
                            .available,
                    color: "#819B6F",
                },
                {
                    name: "In Use",
                    value: inUse,
                    color: "#E2B83E",
                },
                {
                    name: "Maintenance",
                    value:
                        stats.assets
                            .maintenance,
                    color: "#C98655",
                },
            ];
        }, [stats]);

    const resolutionRate =
        useMemo(() => {
            if (
                !stats ||
                stats.tickets.total === 0
            ) {
                return 0;
            }

            return Math.round(
                ((stats.tickets.resolved +
                    stats.tickets.closed) /
                    stats.tickets.total) *
                100
            );
        }, [stats]);

    /* =========================================================
       HELPERS
       ========================================================= */

    const getPriorityClass = (
        priority: TicketPriority
    ) => {
        return `dashboard-priority dashboard-priority-${priority.toLowerCase()}`;
    };

    const getStatusClass = (
        status: TicketStatus
    ) => {
        return `dashboard-status dashboard-status-${status
            .toLowerCase()
            .replace("_", "-")}`;
    };

    const formatStatus = (
        status: TicketStatus
    ) => {
        return status
            .replace("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };

    /* =========================================================
       STATES
       ========================================================= */

    if (loading) {
        return (
            <div className="dashboard-state">

                <div className="dashboard-loading-orbit">
                    <Activity size={25} />
                </div>

                <strong>
                    Preparing your workspace
                </strong>

                <p>
                    Loading WASL operations...
                </p>

            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">

                <div className="dashboard-error-icon">
                    <AlertTriangle
                        size={22}
                    />
                </div>

                <div>
                    <strong>
                        Dashboard unavailable
                    </strong>

                    <p>
                        {error}
                    </p>
                </div>

            </div>
        );
    }

    if (!stats) {
        return (
            <div className="dashboard-state">
                <p>
                    No dashboard data
                    available.
                </p>
            </div>
        );
    }

    /* =========================================================
       PERMISSIONS
       ========================================================= */

    const isAdmin =
        currentUser?.role ===
        "ADMIN";

    const canCreateTicket =
        currentUser?.role ===
        "ADMIN" ||
        currentUser?.role ===
        "EMPLOYEE";

    const displayName =
        currentUser?.fullName ??
        "User";

    /* =========================================================
       UI
       ========================================================= */

    return (
        <div className="dashboard-page">

            {/* HERO */}

            <section className="dashboard-hero">

                <div className="dashboard-hero-main">

                    <div className="dashboard-live-label">
                        <span />
                        WASL OPERATIONS
                    </div>

                    <h1>
                        Welcome back,{" "}
                        <span>
                            {displayName}
                        </span>
                    </h1>

                    <p>
                        Your IT operations,
                        support requests and
                        infrastructure — connected
                        in one workspace.
                    </p>

                    <div className="dashboard-hero-actions">

                        {canCreateTicket && (
                            <Link
                                to="/tickets/new"
                                className="dashboard-action-primary"
                            >
                                <Plus size={17} />

                                New Ticket

                                <ArrowUpRight
                                    size={15}
                                />
                            </Link>
                        )}

                        <Link
                            to="/tickets"
                            className="dashboard-action-secondary"
                        >
                            View Tickets

                            <ChevronRight
                                size={16}
                            />
                        </Link>

                    </div>

                </div>

                <div className="dashboard-hero-insight">

                    <div className="dashboard-insight-top">

                        <div className="dashboard-insight-icon">
                            <Gauge size={21} />
                        </div>

                        <span>
                            Operations Health
                        </span>

                    </div>

                    <div className="dashboard-health-score">

                        <strong>
                            {resolutionRate}%
                        </strong>

                        <span>
                            resolution rate
                        </span>

                    </div>

                    <div className="dashboard-health-track">
                        <span
                            style={{
                                width:
                                    `${resolutionRate}%`,
                            }}
                        />
                    </div>

                    <div className="dashboard-health-footer">

                        <span>
                            <ShieldCheck
                                size={14}
                            />
                            Live system data
                        </span>

                        <span>
                            {stats.tickets.open} open
                        </span>

                    </div>

                </div>

            </section>

            {/* KPI BENTO */}

            <section className="dashboard-kpi-grid">

                <article className="dashboard-kpi dashboard-kpi-featured">

                    <div className="dashboard-kpi-top">

                        <div className="dashboard-kpi-icon">
                            <TicketCheck
                                size={20}
                            />
                        </div>

                        <span className="dashboard-kpi-label">
                            Total Tickets
                        </span>

                    </div>

                    <strong className="dashboard-kpi-value">
                        {stats.tickets.total}
                    </strong>

                    <div className="dashboard-kpi-bottom">

                        <span>
                            {stats.tickets.open}
                            {" "}
                            open requests
                        </span>

                        <Link to="/tickets">
                            View
                            <ArrowUpRight
                                size={13}
                            />
                        </Link>

                    </div>

                </article>

                <article className="dashboard-kpi">

                    <div className="dashboard-kpi-top">

                        <div className="dashboard-kpi-icon dashboard-kpi-progress">
                            <Clock3 size={20} />
                        </div>

                        <span className="dashboard-kpi-label">
                            In Progress
                        </span>

                    </div>

                    <strong className="dashboard-kpi-value">
                        {stats.tickets.inProgress}
                    </strong>

                    <div className="dashboard-kpi-bottom">
                        <span>
                            Active support work
                        </span>
                    </div>

                </article>

                <article className="dashboard-kpi">

                    <div className="dashboard-kpi-top">

                        <div className="dashboard-kpi-icon dashboard-kpi-success">
                            <CheckCircle2
                                size={20}
                            />
                        </div>

                        <span className="dashboard-kpi-label">
                            Resolved
                        </span>

                    </div>

                    <strong className="dashboard-kpi-value">
                        {stats.tickets.resolved}
                    </strong>

                    <div className="dashboard-kpi-bottom">
                        <span>
                            Successfully handled
                        </span>
                    </div>

                </article>

                <article
                    className={`dashboard-kpi ${stats.tickets.slaBreached >
                        0
                        ? "dashboard-kpi-alert"
                        : ""
                        }`}
                >

                    <div className="dashboard-kpi-top">

                        <div className="dashboard-kpi-icon dashboard-kpi-danger">
                            <AlertCircle
                                size={20}
                            />
                        </div>

                        <span className="dashboard-kpi-label">
                            SLA Breached
                        </span>

                    </div>

                    <strong className="dashboard-kpi-value">
                        {stats.tickets.slaBreached}
                    </strong>

                    <div className="dashboard-kpi-bottom">
                        <span>
                            Requires attention
                        </span>
                    </div>

                </article>

            </section>

            {/* MAIN ANALYTICS */}

            <section className="dashboard-analytics-grid">

                {/* BAR CHART */}

                <article className="dashboard-surface dashboard-ticket-chart">

                    <div className="dashboard-panel-header">

                        <div>

                            <span className="dashboard-panel-eyebrow">
                                SUPPORT FLOW
                            </span>

                            <h2>
                                Ticket Overview
                            </h2>

                            <p>
                                Current workload
                                across every support stage.
                            </p>

                        </div>

                        <div className="dashboard-live-chip">
                            <span />
                            Live
                        </div>

                    </div>

                    <div className="dashboard-chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={270}
                        >

                            <BarChart
                                data={ticketChartData}
                                barSize={30}
                            >

                                <CartesianGrid
                                    strokeDasharray="4 5"
                                    vertical={false}
                                    stroke="rgba(100, 75, 50, 0.07)"
                                />

                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill:
                                            "#998A7C",
                                        fontSize: 11,
                                    }}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill:
                                            "#A09184",
                                        fontSize: 11,
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill:
                                            "rgba(255, 208, 55, 0.07)",
                                    }}
                                    contentStyle={{
                                        background:
                                            "rgba(61, 44, 30, .94)",
                                        border:
                                            "1px solid rgba(255,255,255,.1)",
                                        borderRadius:
                                            "13px",
                                        color: "#fff",
                                        boxShadow:
                                            "0 15px 35px rgba(59,40,23,.16)",
                                    }}
                                />

                                <Bar
                                    dataKey="value"
                                    fill="#E7B82B"
                                    radius={[
                                        9,
                                        9,
                                        3,
                                        3,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </article>

                {/* PRIORITY */}

                <article className="dashboard-surface dashboard-priority-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <span className="dashboard-panel-eyebrow">
                                RISK
                            </span>

                            <h2>
                                Ticket Priority
                            </h2>

                            <p>
                                Current support
                                urgency distribution.
                            </p>

                        </div>

                    </div>

                    <div className="dashboard-donut-layout">

                        <div className="dashboard-donut">

                            <ResponsiveContainer
                                width="100%"
                                height={210}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            priorityChartData
                                        }
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={61}
                                        outerRadius={83}
                                        paddingAngle={4}
                                        stroke="none"
                                    >
                                        {priorityChartData.map(
                                            (entry) => (
                                                <Cell
                                                    key={
                                                        entry.name
                                                    }
                                                    fill={
                                                        entry.color
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "rgba(61,44,30,.94)",
                                            border:
                                                "1px solid rgba(255,255,255,.1)",
                                            borderRadius:
                                                "13px",
                                            color:
                                                "#fff",
                                        }}
                                    />

                                </PieChart>

                            </ResponsiveContainer>

                            <div className="dashboard-donut-center">

                                <strong>
                                    {stats.tickets.total}
                                </strong>

                                <span>
                                    tickets
                                </span>

                            </div>

                        </div>

                        <div className="dashboard-chart-legend">

                            {priorityChartData.map(
                                (item) => (
                                    <div
                                        className="dashboard-legend-row"
                                        key={item.name}
                                    >

                                        <div>

                                            <span
                                                className="dashboard-legend-dot"
                                                style={{
                                                    background:
                                                        item.color,
                                                }}
                                            />

                                            <span>
                                                {item.name}
                                            </span>

                                        </div>

                                        <strong>
                                            {item.value}
                                        </strong>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </article>

            </section>

            {/* RECENT + ASSETS */}

            <section className="dashboard-lower-grid">

                {/* RECENT TICKETS */}

                <article className="dashboard-surface dashboard-recent-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <span className="dashboard-panel-eyebrow">
                                ACTIVITY
                            </span>

                            <h2>
                                Recent Tickets
                            </h2>

                            <p>
                                Latest requests
                                entering the support desk.
                            </p>

                        </div>

                        <Link
                            to="/tickets"
                            className="dashboard-panel-link"
                        >
                            View all

                            <ArrowUpRight
                                size={14}
                            />
                        </Link>

                    </div>

                    {recentTickets.length ===
                        0 ? (
                        <div className="dashboard-empty">

                            <CircleDot
                                size={26}
                            />

                            <strong>
                                All clear
                            </strong>

                            <p>
                                No support tickets
                                available yet.
                            </p>

                        </div>
                    ) : (
                        <div className="dashboard-table-scroll">

                            <table className="dashboard-ticket-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Ticket
                                        </th>

                                        <th>
                                            Issue
                                        </th>

                                        <th>
                                            Priority
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Assigned
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {recentTickets.map(
                                        (ticket) => (
                                            <tr
                                                key={
                                                    ticket.id
                                                }
                                            >

                                                <td>
                                                    <Link
                                                        to={`/tickets/${ticket.id}`}
                                                        className="dashboard-ticket-number"
                                                    >
                                                        {
                                                            ticket.ticketNumber
                                                        }
                                                    </Link>
                                                </td>

                                                <td>

                                                    <div className="dashboard-ticket-copy">

                                                        <strong>
                                                            {
                                                                ticket.title
                                                            }
                                                        </strong>

                                                        <span>
                                                            {ticket.category
                                                                ?.name ??
                                                                "General"}
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            getPriorityClass(
                                                                ticket.priority
                                                            )
                                                        }
                                                    >
                                                        {
                                                            ticket.priority
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            getStatusClass(
                                                                ticket.status
                                                            )
                                                        }
                                                    >
                                                        {
                                                            formatStatus(
                                                                ticket.status
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="dashboard-assignee">
                                                        {ticket.assignedTo
                                                            ?.fullName ??
                                                            "Unassigned"}
                                                    </span>
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </article>

                {/* ASSET HEALTH */}

                <article className="dashboard-surface dashboard-assets-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <span className="dashboard-panel-eyebrow">
                                INFRASTRUCTURE
                            </span>

                            <h2>
                                Asset Health
                            </h2>

                            <p>
                                Current IT inventory
                                status.
                            </p>

                        </div>

                        <div className="dashboard-panel-round-icon">
                            <ServerCog
                                size={18}
                            />
                        </div>

                    </div>

                    <div className="dashboard-assets-donut">

                        <ResponsiveContainer
                            width="100%"
                            height={195}
                        >

                            <PieChart>

                                <Pie
                                    data={
                                        assetChartData
                                    }
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={53}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {assetChartData.map(
                                        (entry) => (
                                            <Cell
                                                key={
                                                    entry.name
                                                }
                                                fill={
                                                    entry.color
                                                }
                                            />
                                        )
                                    )}
                                </Pie>

                                <Tooltip
                                    contentStyle={{
                                        background:
                                            "rgba(61,44,30,.94)",
                                        border:
                                            "1px solid rgba(255,255,255,.1)",
                                        borderRadius:
                                            "13px",
                                        color:
                                            "#fff",
                                    }}
                                />

                            </PieChart>

                        </ResponsiveContainer>

                        <div className="dashboard-assets-center">

                            <strong>
                                {
                                    stats.assets.total
                                }
                            </strong>

                            <span>
                                Assets
                            </span>

                        </div>

                    </div>

                    <div className="dashboard-assets-list">

                        {assetChartData.map(
                            (item) => (
                                <div
                                    className="dashboard-asset-row"
                                    key={item.name}
                                >

                                    <div>

                                        <span
                                            style={{
                                                background:
                                                    item.color,
                                            }}
                                        />

                                        {item.name}

                                    </div>

                                    <strong>
                                        {item.value}
                                    </strong>

                                </div>
                            )
                        )}

                    </div>

                    <Link
                        to="/assets"
                        className="dashboard-assets-link"
                    >
                        Manage Assets

                        <ArrowUpRight
                            size={14}
                        />
                    </Link>

                </article>

            </section>

            {/* QUICK OPERATIONS */}

            <section className="dashboard-quick-grid">

                <div className="dashboard-quick-heading">

                    <div>

                        <span className="dashboard-panel-eyebrow">
                            QUICK VIEW
                        </span>

                        <h2>
                            Operations Snapshot
                        </h2>

                    </div>

                    <Sparkles
                        size={18}
                    />

                </div>

                <div className="dashboard-quick-items">

                    <article className="dashboard-quick-card">

                        <div className="dashboard-quick-icon">
                            <Users size={18} />
                        </div>

                        <div>
                            <span>
                                Active Users
                            </span>

                            <strong>
                                {
                                    stats.users
                                        .totalActive
                                }
                            </strong>
                        </div>

                    </article>

                    <article className="dashboard-quick-card">

                        <div className="dashboard-quick-icon">
                            <Laptop size={18} />
                        </div>

                        <div>
                            <span>
                                Total Assets
                            </span>

                            <strong>
                                {
                                    stats.assets.total
                                }
                            </strong>
                        </div>

                    </article>

                    <article className="dashboard-quick-card">

                        <div className="dashboard-quick-icon dashboard-quick-maintenance">
                            <Wrench size={18} />
                        </div>

                        <div>
                            <span>
                                Maintenance
                            </span>

                            <strong>
                                {
                                    stats.assets
                                        .maintenance
                                }
                            </strong>
                        </div>

                    </article>

                    <article className="dashboard-quick-card">

                        <div className="dashboard-quick-icon dashboard-quick-critical">
                            <AlertTriangle
                                size={18}
                            />
                        </div>

                        <div>
                            <span>
                                Critical Issues
                            </span>

                            <strong>
                                {
                                    stats.tickets
                                        .critical
                                }
                            </strong>
                        </div>

                    </article>

                </div>

            </section>

            {/* ADMIN QUICK ACTION */}

            {isAdmin && (
                <section className="dashboard-admin-strip">

                    <div>

                        <div className="dashboard-admin-icon">
                            <ServerCog
                                size={20}
                            />
                        </div>

                        <div>
                            <strong>
                                Asset administration
                            </strong>

                            <span>
                                Register and manage
                                company IT equipment.
                            </span>
                        </div>

                    </div>

                    <Link
                        to="/assets/new"
                    >
                        <Plus size={15} />

                        Add Asset
                    </Link>

                </section>
            )}

        </div>
    );
}