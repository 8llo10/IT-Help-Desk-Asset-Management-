import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    CircleDot,
    Clock3,
    HardDrive,
    Layers3,
    PackageCheck,
    ShieldAlert,
    Sparkles,
    Ticket,
    TrendingUp,
    Wrench,
} from "lucide-react";

import api from "../api/client";

import "../styles/ReportsPage.css";

type TicketStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

type TicketPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

type AssetStatus =
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";

interface Ticket {
    id: number;

    status: TicketStatus;
    priority: TicketPriority;

    slaDueAt?: string | null;
    resolvedAt?: string | null;
    closedAt?: string | null;

    createdAt: string;

    assignedTo?: {
        id: number;
        fullName: string;
    } | null;

    category?: {
        id: number;
        name: string;
    } | null;
}

interface Asset {
    id: number;

    status: AssetStatus;
    type: string;

    department?: {
        id: number;
        name: string;
    } | null;
}

interface DistributionRowProps {
    label: string;
    value: number;
    total: number;
    tone:
    | "yellow"
    | "pink"
    | "green"
    | "brown"
    | "orange"
    | "muted";
}

function DistributionRow({
    label,
    value,
    total,
    tone,
}: DistributionRowProps) {
    const percentage =
        total === 0
            ? 0
            : Math.round(
                (value / total) *
                100
            );

    return (
        <div className="reports-distribution-row">

            <div className="reports-distribution-top">

                <span>
                    {label}
                </span>

                <div>
                    <strong>
                        {value}
                    </strong>

                    <small>
                        {percentage}%
                    </small>
                </div>

            </div>

            <div className="reports-progress-track">

                <span
                    className={`reports-progress-fill reports-progress-${tone}`}
                    style={{
                        width:
                            `${percentage}%`,
                    }}
                />

            </div>

        </div>
    );
}

export default function ReportsPage() {
    const [
        tickets,
        setTickets,
    ] =
        useState<Ticket[]>([]);

    const [
        assets,
        setAssets,
    ] =
        useState<Asset[]>([]);

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
       LOAD
       ========================================================= */

    useEffect(() => {
        const fetchReports =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const [
                        ticketsResponse,
                        assetsResponse,
                    ] =
                        await Promise.all([
                            api.get(
                                "/tickets"
                            ),
                            api.get(
                                "/assets"
                            ),
                        ]);

                    const ticketsData =
                        ticketsResponse.data
                            ?.data?.tickets ??
                        ticketsResponse.data
                            ?.data ??
                        [];

                    const assetsData =
                        assetsResponse.data
                            ?.data?.assets ??
                        assetsResponse.data
                            ?.data ??
                        [];

                    setTickets(
                        Array.isArray(
                            ticketsData
                        )
                            ? ticketsData
                            : []
                    );

                    setAssets(
                        Array.isArray(
                            assetsData
                        )
                            ? assetsData
                            : []
                    );
                } catch (
                error: any
                ) {
                    setError(
                        error.response?.data
                            ?.message ??
                        "Failed to load reports"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void fetchReports();
    }, []);

    /* =========================================================
       REPORT CALCULATIONS
       ========================================================= */

    const report =
        useMemo(() => {
            const openTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.status ===
                        "OPEN"
                ).length;

            const inProgressTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.status ===
                        "IN_PROGRESS"
                ).length;

            const resolvedTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.status ===
                        "RESOLVED"
                ).length;

            const closedTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.status ===
                        "CLOSED"
                ).length;

            const criticalTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.priority ===
                        "CRITICAL"
                ).length;

            const highTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.priority ===
                        "HIGH"
                ).length;

            const mediumTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.priority ===
                        "MEDIUM"
                ).length;

            const lowTickets =
                tickets.filter(
                    (ticket) =>
                        ticket.priority ===
                        "LOW"
                ).length;

            const overdueTickets =
                tickets.filter(
                    (ticket) => {
                        if (
                            !ticket.slaDueAt
                        ) {
                            return false;
                        }

                        if (
                            ticket.status ===
                            "RESOLVED" ||
                            ticket.status ===
                            "CLOSED"
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
                ).length;

            const availableAssets =
                assets.filter(
                    (asset) =>
                        asset.status ===
                        "AVAILABLE"
                ).length;

            const inUseAssets =
                assets.filter(
                    (asset) =>
                        asset.status ===
                        "IN_USE"
                ).length;

            const maintenanceAssets =
                assets.filter(
                    (asset) =>
                        asset.status ===
                        "MAINTENANCE"
                ).length;

            const retiredAssets =
                assets.filter(
                    (asset) =>
                        asset.status ===
                        "RETIRED"
                ).length;

            const completedTickets =
                resolvedTickets +
                closedTickets;

            const completionRate =
                tickets.length === 0
                    ? 0
                    : Math.round(
                        (completedTickets /
                            tickets.length) *
                        100
                    );

            const activeTickets =
                openTickets +
                inProgressTickets;

            const assetAvailabilityRate =
                assets.length === 0
                    ? 0
                    : Math.round(
                        (availableAssets /
                            assets.length) *
                        100
                    );

            return {
                openTickets,
                inProgressTickets,
                resolvedTickets,
                closedTickets,

                criticalTickets,
                highTickets,
                mediumTickets,
                lowTickets,

                overdueTickets,

                availableAssets,
                inUseAssets,
                maintenanceAssets,
                retiredAssets,

                completedTickets,
                completionRate,

                activeTickets,
                assetAvailabilityRate,
            };
        }, [
            tickets,
            assets,
        ]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="reports-loading">

                <div className="reports-loading-icon">
                    <BarChart3
                        size={25}
                    />
                </div>

                <strong>
                    Loading reports
                </strong>

                <p>
                    Building your IT operations
                    overview...
                </p>

            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="reports-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="reports-hero">

                <div className="reports-hero-copy">

                    <div className="reports-eyebrow">
                        <span />
                        IT OPERATIONS INTELLIGENCE
                    </div>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        A consolidated view of support
                        performance, SLA pressure and
                        asset operational status across
                        WASL.
                    </p>

                </div>

                <div className="reports-hero-score">

                    <div className="reports-score-ring">
                        <strong>
                            {
                                report.completionRate
                            }%
                        </strong>

                        <span>
                            Completion
                        </span>
                    </div>

                    <div>

                        <span>
                            Support Performance
                        </span>

                        <strong>
                            {
                                report.completedTickets
                            }{" "}
                            completed
                        </strong>

                        <small>
                            out of{" "}
                            {
                                tickets.length
                            }{" "}
                            tickets
                        </small>

                    </div>

                </div>

            </section>

            {/* =====================================================
          ERROR
          ===================================================== */}

            {error && (
                <div className="reports-alert">

                    <AlertTriangle
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* =====================================================
          MAIN KPI GRID
          ===================================================== */}

            <section className="reports-kpi-grid">

                <article className="reports-kpi-card">

                    <div className="reports-kpi-icon">
                        <Ticket
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            Total Tickets
                        </span>

                        <strong>
                            {
                                tickets.length
                            }
                        </strong>

                        <small>
                            Support requests
                        </small>

                    </div>

                </article>

                <article className="reports-kpi-card">

                    <div className="reports-kpi-icon reports-kpi-icon-green">
                        <CheckCircle2
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {
                                report.completedTickets
                            }
                        </strong>

                        <small>
                            Resolved + closed
                        </small>

                    </div>

                </article>

                <article className="reports-kpi-card">

                    <div className="reports-kpi-icon reports-kpi-icon-pink">
                        <Activity
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            Active Tickets
                        </span>

                        <strong>
                            {
                                report.activeTickets
                            }
                        </strong>

                        <small>
                            Open + in progress
                        </small>

                    </div>

                </article>

                <article
                    className={`reports-kpi-card ${report.overdueTickets >
                            0
                            ? "reports-kpi-warning"
                            : ""
                        }`}
                >

                    <div className="reports-kpi-icon reports-kpi-icon-warning">
                        <ShieldAlert
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            SLA Overdue
                        </span>

                        <strong>
                            {
                                report.overdueTickets
                            }
                        </strong>

                        <small>
                            Active overdue tickets
                        </small>

                    </div>

                </article>

            </section>

            {/* =====================================================
          PRIMARY REPORT GRID
          ===================================================== */}

            <section className="reports-main-grid">

                {/* ===================================================
            SUPPORT PERFORMANCE
            =================================================== */}

                <article className="reports-panel reports-performance-panel">

                    <div className="reports-panel-header">

                        <div>

                            <span className="reports-section-label">
                                SERVICE DESK
                            </span>

                            <h2>
                                Support Performance
                            </h2>

                            <p>
                                Current ticket workflow and
                                completion performance.
                            </p>

                        </div>

                        <div className="reports-panel-icon">
                            <TrendingUp
                                size={18}
                            />
                        </div>

                    </div>

                    <div className="reports-performance-body">

                        <div className="reports-completion">

                            <div
                                className="reports-completion-ring"
                                style={{
                                    "--completion":
                                        `${report.completionRate * 3.6}deg`,
                                } as React.CSSProperties}
                            >

                                <div>
                                    <strong>
                                        {
                                            report.completionRate
                                        }%
                                    </strong>

                                    <span>
                                        Completed
                                    </span>
                                </div>

                            </div>

                            <div className="reports-completion-copy">

                                <span>
                                    TICKET COMPLETION
                                </span>

                                <h3>
                                    {
                                        report.completedTickets
                                    }{" "}
                                    of{" "}
                                    {
                                        tickets.length
                                    }
                                </h3>

                                <p>
                                    Calculated from resolved
                                    and closed tickets currently
                                    returned by WASL.
                                </p>

                            </div>

                        </div>

                        <div className="reports-performance-mini-grid">

                            <div>

                                <CircleDot
                                    size={15}
                                />

                                <span>
                                    Open
                                </span>

                                <strong>
                                    {
                                        report.openTickets
                                    }
                                </strong>

                            </div>

                            <div>

                                <Clock3
                                    size={15}
                                />

                                <span>
                                    In Progress
                                </span>

                                <strong>
                                    {
                                        report.inProgressTickets
                                    }
                                </strong>

                            </div>

                            <div>

                                <CheckCircle2
                                    size={15}
                                />

                                <span>
                                    Resolved
                                </span>

                                <strong>
                                    {
                                        report.resolvedTickets
                                    }
                                </strong>

                            </div>

                            <div>

                                <PackageCheck
                                    size={15}
                                />

                                <span>
                                    Closed
                                </span>

                                <strong>
                                    {
                                        report.closedTickets
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>

                </article>

                {/* ===================================================
            SLA
            =================================================== */}

                <article
                    className={`reports-panel reports-sla-panel ${report.overdueTickets >
                            0
                            ? "has-overdue"
                            : ""
                        }`}
                >

                    <div className="reports-panel-header">

                        <div>

                            <span className="reports-section-label">
                                SLA CONTROL
                            </span>

                            <h2>
                                SLA Monitor
                            </h2>

                            <p>
                                Active tickets currently
                                beyond their SLA due time.
                            </p>

                        </div>

                        <div className="reports-panel-icon reports-panel-icon-warning">
                            <ShieldAlert
                                size={18}
                            />
                        </div>

                    </div>

                    <div className="reports-sla-value">

                        <strong>
                            {
                                report.overdueTickets
                            }
                        </strong>

                        <span>
                            overdue tickets
                        </span>

                    </div>

                    <div className="reports-sla-state">

                        {report.overdueTickets ===
                            0 ? (
                            <>
                                <CheckCircle2
                                    size={16}
                                />

                                <div>

                                    <strong>
                                        No current SLA overdue
                                    </strong>

                                    <p>
                                        No unresolved or open
                                        ticket is currently past
                                        its SLA due date.
                                    </p>

                                </div>
                            </>
                        ) : (
                            <>
                                <AlertTriangle
                                    size={16}
                                />

                                <div>

                                    <strong>
                                        Attention required
                                    </strong>

                                    <p>
                                        Review active tickets
                                        that have exceeded their
                                        SLA due time.
                                    </p>

                                </div>
                            </>
                        )}

                    </div>

                </article>

            </section>

            {/* =====================================================
          DISTRIBUTION GRID
          ===================================================== */}

            <section className="reports-distribution-grid">

                {/* STATUS */}

                <article className="reports-panel">

                    <div className="reports-panel-header">

                        <div>

                            <span className="reports-section-label">
                                WORKFLOW
                            </span>

                            <h2>
                                Tickets by Status
                            </h2>

                            <p>
                                Distribution across the
                                support lifecycle.
                            </p>

                        </div>

                        <div className="reports-panel-icon">
                            <Layers3
                                size={18}
                            />
                        </div>

                    </div>

                    <div className="reports-distribution-list">

                        <DistributionRow
                            label="Open"
                            value={
                                report.openTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="yellow"
                        />

                        <DistributionRow
                            label="In Progress"
                            value={
                                report.inProgressTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="pink"
                        />

                        <DistributionRow
                            label="Resolved"
                            value={
                                report.resolvedTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="green"
                        />

                        <DistributionRow
                            label="Closed"
                            value={
                                report.closedTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="brown"
                        />

                    </div>

                </article>

                {/* PRIORITY */}

                <article className="reports-panel">

                    <div className="reports-panel-header">

                        <div>

                            <span className="reports-section-label">
                                PRIORITY MIX
                            </span>

                            <h2>
                                Tickets by Priority
                            </h2>

                            <p>
                                Current support workload by
                                assigned priority.
                            </p>

                        </div>

                        <div className="reports-panel-icon reports-panel-icon-pink">
                            <BarChart3
                                size={18}
                            />
                        </div>

                    </div>

                    <div className="reports-distribution-list">

                        <DistributionRow
                            label="Critical"
                            value={
                                report.criticalTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="pink"
                        />

                        <DistributionRow
                            label="High"
                            value={
                                report.highTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="orange"
                        />

                        <DistributionRow
                            label="Medium"
                            value={
                                report.mediumTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="yellow"
                        />

                        <DistributionRow
                            label="Low"
                            value={
                                report.lowTickets
                            }
                            total={
                                tickets.length
                            }
                            tone="muted"
                        />

                    </div>

                </article>

            </section>

            {/* =====================================================
          ASSETS
          ===================================================== */}

            <section className="reports-assets-section">

                <div className="reports-assets-heading">

                    <div>

                        <span className="reports-section-label">
                            ASSET OPERATIONS
                        </span>

                        <h2>
                            Asset Overview
                        </h2>

                        <p>
                            Current status of assets
                            registered in WASL.
                        </p>

                    </div>

                    <div className="reports-assets-total">

                        <HardDrive
                            size={17}
                        />

                        <div>

                            <span>
                                Total Assets
                            </span>

                            <strong>
                                {
                                    assets.length
                                }
                            </strong>

                        </div>

                    </div>

                </div>

                <div className="reports-assets-grid">

                    <article>

                        <div className="reports-asset-card-head">

                            <div className="reports-asset-icon reports-asset-icon-green">
                                <PackageCheck
                                    size={18}
                                />
                            </div>

                            <span>
                                Available
                            </span>

                        </div>

                        <strong>
                            {
                                report.availableAssets
                            }
                        </strong>

                        <div className="reports-asset-progress">

                            <span
                                style={{
                                    width:
                                        `${assets.length ===
                                            0
                                            ? 0
                                            : Math.round(
                                                (
                                                    report.availableAssets /
                                                    assets.length
                                                ) * 100
                                            )
                                        }%`,
                                }}
                            />

                        </div>

                    </article>

                    <article>

                        <div className="reports-asset-card-head">

                            <div className="reports-asset-icon">
                                <HardDrive
                                    size={18}
                                />
                            </div>

                            <span>
                                In Use
                            </span>

                        </div>

                        <strong>
                            {
                                report.inUseAssets
                            }
                        </strong>

                        <div className="reports-asset-progress">

                            <span
                                style={{
                                    width:
                                        `${assets.length ===
                                            0
                                            ? 0
                                            : Math.round(
                                                (
                                                    report.inUseAssets /
                                                    assets.length
                                                ) * 100
                                            )
                                        }%`,
                                }}
                            />

                        </div>

                    </article>

                    <article>

                        <div className="reports-asset-card-head">

                            <div className="reports-asset-icon reports-asset-icon-pink">
                                <Wrench
                                    size={18}
                                />
                            </div>

                            <span>
                                Maintenance
                            </span>

                        </div>

                        <strong>
                            {
                                report.maintenanceAssets
                            }
                        </strong>

                        <div className="reports-asset-progress reports-asset-progress-pink">

                            <span
                                style={{
                                    width:
                                        `${assets.length ===
                                            0
                                            ? 0
                                            : Math.round(
                                                (
                                                    report.maintenanceAssets /
                                                    assets.length
                                                ) * 100
                                            )
                                        }%`,
                                }}
                            />

                        </div>

                    </article>

                    <article>

                        <div className="reports-asset-card-head">

                            <div className="reports-asset-icon reports-asset-icon-muted">
                                <CircleDot
                                    size={18}
                                />
                            </div>

                            <span>
                                Retired
                            </span>

                        </div>

                        <strong>
                            {
                                report.retiredAssets
                            }
                        </strong>

                        <div className="reports-asset-progress reports-asset-progress-muted">

                            <span
                                style={{
                                    width:
                                        `${assets.length ===
                                            0
                                            ? 0
                                            : Math.round(
                                                (
                                                    report.retiredAssets /
                                                    assets.length
                                                ) * 100
                                            )
                                        }%`,
                                }}
                            />

                        </div>

                    </article>

                </div>

                <div className="reports-assets-footer">

                    <Sparkles
                        size={15}
                    />

                    <div>

                        <span>
                            Asset availability
                        </span>

                        <strong>
                            {
                                report.assetAvailabilityRate
                            }%
                        </strong>

                    </div>

                </div>

            </section>

        </div>
    );
}