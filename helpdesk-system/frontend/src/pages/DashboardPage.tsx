import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    Activity,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    CircleDot,
    Clock3,
    Laptop,
    Plus,
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

type DashboardStats = {
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
};

type RecentTicket = {
    id: number;
    ticketNumber: string;
    title: string;
    priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

    status:
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

    createdAt: string;
    slaDueAt?: string | null;

    category?: {
        id: number;
        name: string;
    };

    createdBy?: {
        id: number;
        fullName: string;
    };

    assignedTo?: {
        id: number;
        fullName: string;
    } | null;
};

type User = {
    id?: number;
    fullName?: string;
    email?: string;
    role?: "EMPLOYEE" | "TECHNICIAN" | "ADMIN";
};

export default function DashboardPage() {
    const [stats, setStats] =
        useState<DashboardStats | null>(null);

    const [recentTickets, setRecentTickets] =
        useState<RecentTicket[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const currentUser: User = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    statsResponse,
                    recentTicketsResponse,
                ] = await Promise.all([
                    api.get("/dashboard/stats"),

                    api.get(
                        "/dashboard/recent-tickets"
                    ),
                ]);

                setStats(statsResponse.data.data);

                setRecentTickets(
                    recentTicketsResponse.data.data
                        .tickets || []
                );
            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const ticketChartData = useMemo(() => {
        if (!stats) {
            return [];
        }

        return [
            {
                name: "Open",
                value: stats.tickets.open,
            },
            {
                name: "Progress",
                value: stats.tickets.inProgress,
            },
            {
                name: "Resolved",
                value: stats.tickets.resolved,
            },
            {
                name: "Closed",
                value: stats.tickets.closed,
            },
        ];
    }, [stats]);

    const priorityChartData = useMemo(() => {
        if (!stats) {
            return [];
        }

        const normalTickets = Math.max(
            stats.tickets.total -
            stats.tickets.high -
            stats.tickets.critical,
            0
        );

        return [
            {
                name: "Normal",
                value: normalTickets,
                color: "#7266ff",
            },
            {
                name: "High",
                value: stats.tickets.high,
                color: "#ff9f43",
            },
            {
                name: "Critical",
                value: stats.tickets.critical,
                color: "#ff4d6d",
            },
        ];
    }, [stats]);

    const assetChartData = useMemo(() => {
        if (!stats) {
            return [];
        }

        const inUse = Math.max(
            stats.assets.total -
            stats.assets.available -
            stats.assets.maintenance,
            0
        );

        return [
            {
                name: "Available",
                value: stats.assets.available,
                color: "#6c63ff",
            },
            {
                name: "In Use",
                value: inUse,
                color: "#c084fc",
            },
            {
                name: "Maintenance",
                value: stats.assets.maintenance,
                color: "#ff9f43",
            },
        ];
    }, [stats]);

    const getPriorityClass = (
        priority: RecentTicket["priority"]
    ) => {
        return `priority-badge priority-${priority.toLowerCase()}`;
    };

    const getStatusClass = (
        status: RecentTicket["status"]
    ) => {
        return `status-badge status-${status
            .toLowerCase()
            .replace("_", "-")}`;
    };

    const formatStatus = (
        status: RecentTicket["status"]
    ) => {
        return status
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    if (loading) {
        return (
            <div className="dashboard-state">
                <Activity className="dashboard-loader" />

                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <AlertTriangle size={22} />

                <div>
                    <strong>
                        Dashboard unavailable
                    </strong>

                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="dashboard-state">
                <p>No dashboard data available.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* HEADER */}

            <section className="dashboard-header">
                <div>
                    <p className="dashboard-eyebrow">
                        IT Operations Center
                    </p>

                    <h1>
                        Welcome back,{" "}
                        <span>
                            {currentUser.fullName ||
                                "Admin"}
                        </span>
                    </h1>

                    <p className="dashboard-subtitle">
                        Here's what's happening across
                        your IT support environment today.
                    </p>
                </div>

                <div className="dashboard-header-actions">
                    <Link
                        to="/tickets/new"
                        className="dashboard-primary-button"
                    >
                        <Plus size={18} />

                        New Ticket
                    </Link>

                    {currentUser.role === "ADMIN" && (
                        <Link
                            to="/assets/new"
                            className="dashboard-secondary-button"
                        >
                            <Laptop size={18} />

                            Add Asset
                        </Link>
                    )}
                </div>
            </section>

            {/* TOP STATS */}

            <section className="stats-grid">
                <article className="stat-card stat-card-primary">
                    <div className="stat-card-top">
                        <div className="stat-icon">
                            <TicketCheck size={21} />
                        </div>

                        <span className="stat-label">
                            Total Tickets
                        </span>
                    </div>

                    <div className="stat-value">
                        {stats.tickets.total}
                    </div>

                    <div className="stat-footer">
                        <span>
                            {stats.tickets.open} currently
                            open
                        </span>

                        <ArrowRight size={15} />
                    </div>
                </article>

                <article className="stat-card">
                    <div className="stat-card-top">
                        <div className="stat-icon">
                            <Clock3 size={21} />
                        </div>

                        <span className="stat-label">
                            In Progress
                        </span>
                    </div>

                    <div className="stat-value">
                        {stats.tickets.inProgress}
                    </div>

                    <div className="stat-footer">
                        <span>
                            Active IT support work
                        </span>
                    </div>
                </article>

                <article className="stat-card">
                    <div className="stat-card-top">
                        <div className="stat-icon">
                            <CheckCircle2 size={21} />
                        </div>

                        <span className="stat-label">
                            Resolved
                        </span>
                    </div>

                    <div className="stat-value">
                        {stats.tickets.resolved}
                    </div>

                    <div className="stat-footer">
                        <span>
                            Issues resolved successfully
                        </span>
                    </div>
                </article>

                <article
                    className={`stat-card ${stats.tickets.slaBreached > 0
                            ? "stat-card-danger"
                            : ""
                        }`}
                >
                    <div className="stat-card-top">
                        <div className="stat-icon">
                            <AlertTriangle size={21} />
                        </div>

                        <span className="stat-label">
                            SLA Breached
                        </span>
                    </div>

                    <div className="stat-value">
                        {stats.tickets.slaBreached}
                    </div>

                    <div className="stat-footer">
                        <span>
                            Requires attention
                        </span>
                    </div>
                </article>
            </section>

            {/* CHARTS */}

            <section className="dashboard-main-grid">
                <article className="dashboard-panel dashboard-chart-panel">
                    <div className="panel-header">
                        <div>
                            <h2>
                                Ticket Overview
                            </h2>

                            <p>
                                Current support workload by
                                status
                            </p>
                        </div>

                        <div className="panel-chip">
                            Live
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer
                            width="100%"
                            height={280}
                        >
                            <BarChart
                                data={ticketChartData}
                                barSize={32}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="rgba(255,255,255,0.07)"
                                />

                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#898696",
                                        fontSize: 12,
                                    }}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#898696",
                                        fontSize: 12,
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill:
                                            "rgba(124, 92, 255, 0.07)",
                                    }}
                                    contentStyle={{
                                        background: "#17151c",
                                        border:
                                            "1px solid rgba(255,255,255,.1)",
                                        borderRadius: "12px",
                                        color: "#fff",
                                    }}
                                />

                                <Bar
                                    dataKey="value"
                                    fill="#8b72ff"
                                    radius={[8, 8, 2, 2]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                <article className="dashboard-panel">
                    <div className="panel-header">
                        <div>
                            <h2>
                                Ticket Priority
                            </h2>

                            <p>
                                Current risk distribution
                            </p>
                        </div>
                    </div>

                    <div className="priority-chart-layout">
                        <div className="pie-chart">
                            <ResponsiveContainer
                                width="100%"
                                height={220}
                            >
                                <PieChart>
                                    <Pie
                                        data={priorityChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={58}
                                        outerRadius={85}
                                        paddingAngle={4}
                                    >
                                        {priorityChartData.map(
                                            (entry) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={entry.color}
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            background: "#17151c",
                                            border:
                                                "1px solid rgba(255,255,255,.1)",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pie-center">
                                <strong>
                                    {stats.tickets.total}
                                </strong>

                                <span>
                                    Tickets
                                </span>
                            </div>
                        </div>

                        <div className="chart-legend">
                            {priorityChartData.map(
                                (item) => (
                                    <div
                                        className="legend-item"
                                        key={item.name}
                                    >
                                        <div>
                                            <span
                                                className="legend-dot"
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

            <section className="dashboard-bottom-grid">
                <article className="dashboard-panel recent-tickets-panel">
                    <div className="panel-header">
                        <div>
                            <h2>
                                Recent Tickets
                            </h2>

                            <p>
                                Latest IT support requests
                            </p>
                        </div>

                        <Link
                            to="/tickets"
                            className="panel-link"
                        >
                            View all

                            <ArrowRight size={15} />
                        </Link>
                    </div>

                    {recentTickets.length === 0 ? (
                        <div className="empty-state">
                            <CircleDot size={30} />

                            <p>
                                No tickets available yet.
                            </p>
                        </div>
                    ) : (
                        <div className="tickets-table-wrapper">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Ticket</th>
                                        <th>Issue</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentTickets.map(
                                        (ticket) => (
                                            <tr key={ticket.id}>
                                                <td>
                                                    <Link
                                                        to={`/tickets/${ticket.id}`}
                                                        className="ticket-number"
                                                    >
                                                        {
                                                            ticket.ticketNumber
                                                        }
                                                    </Link>
                                                </td>

                                                <td>
                                                    <div className="ticket-title-cell">
                                                        <strong>
                                                            {ticket.title}
                                                        </strong>

                                                        <span>
                                                            {ticket.category
                                                                ?.name ||
                                                                "General"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={getPriorityClass(
                                                            ticket.priority
                                                        )}
                                                    >
                                                        {ticket.priority}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={getStatusClass(
                                                            ticket.status
                                                        )}
                                                    >
                                                        {formatStatus(
                                                            ticket.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    {ticket.assignedTo
                                                        ?.fullName ||
                                                        "Unassigned"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </article>

                <article className="dashboard-panel assets-summary-panel">
                    <div className="panel-header">
                        <div>
                            <h2>
                                Asset Status
                            </h2>

                            <p>
                                Infrastructure availability
                            </p>
                        </div>

                        <Wrench size={19} />
                    </div>

                    <div className="assets-pie">
                        <ResponsiveContainer
                            width="100%"
                            height={205}
                        >
                            <PieChart>
                                <Pie
                                    data={assetChartData}
                                    dataKey="value"
                                    innerRadius={52}
                                    outerRadius={76}
                                    paddingAngle={5}
                                >
                                    {assetChartData.map(
                                        (entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={entry.color}
                                            />
                                        )
                                    )}
                                </Pie>

                                <Tooltip
                                    contentStyle={{
                                        background: "#17151c",
                                        border:
                                            "1px solid rgba(255,255,255,.1)",
                                        borderRadius: "12px",
                                        color: "#fff",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="assets-pie-center">
                            <strong>
                                {stats.assets.total}
                            </strong>

                            <span>
                                Assets
                            </span>
                        </div>
                    </div>

                    <div className="asset-summary-list">
                        {assetChartData.map(
                            (item) => (
                                <div
                                    className="asset-summary-row"
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
                        className="asset-view-link"
                    >
                        Manage Assets

                        <ArrowRight size={15} />
                    </Link>
                </article>
            </section>

            {/* BOTTOM MINI STATS */}

            <section className="mini-stats-grid">
                <article className="mini-stat">
                    <Users size={20} />

                    <div>
                        <span>
                            Active Users
                        </span>

                        <strong>
                            {stats.users.totalActive}
                        </strong>
                    </div>
                </article>

                <article className="mini-stat">
                    <Laptop size={20} />

                    <div>
                        <span>
                            Total Assets
                        </span>

                        <strong>
                            {stats.assets.total}
                        </strong>
                    </div>
                </article>

                <article className="mini-stat">
                    <Wrench size={20} />

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

                <article className="mini-stat">
                    <AlertTriangle size={20} />

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
            </section>
        </div>
    );
}