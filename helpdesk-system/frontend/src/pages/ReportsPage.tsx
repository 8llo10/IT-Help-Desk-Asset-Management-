import {
    useEffect,
    useMemo,
    useState,
} from "react";

import api from "../api/client";

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

export default function ReportsPage() {
    const [tickets, setTickets] =
        useState<Ticket[]>([]);

    const [assets, setAssets] =
        useState<Asset[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

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
                            api.get("/tickets"),
                            api.get("/assets"),
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
                } catch (error: any) {
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
            };
        }, [tickets, assets]);

    if (loading) {
        return (
            <p>
                Loading reports...
            </p>
        );
    }

    return (
        <div>
            <div>
                <h1>
                    Reports
                </h1>

                <p>
                    IT support performance
                    and asset management
                    overview.
                </p>
            </div>

            {error && (
                <p>{error}</p>
            )}

            <section>
                <h2>
                    Support Performance
                </h2>

                <div>
                    <div>
                        <h3>
                            Total Tickets
                        </h3>

                        <strong>
                            {tickets.length}
                        </strong>
                    </div>

                    <div>
                        <h3>
                            Completed
                        </h3>

                        <strong>
                            {
                                report.completedTickets
                            }
                        </strong>
                    </div>

                    <div>
                        <h3>
                            SLA Breached
                        </h3>

                        <strong>
                            {
                                report.overdueTickets
                            }
                        </strong>
                    </div>

                    <div>
                        <h3>
                            Completion Rate
                        </h3>

                        <strong>
                            {
                                report.completionRate
                            }
                            %
                        </strong>
                    </div>
                </div>
            </section>

            <hr />

            <section>
                <h2>
                    Tickets by Status
                </h2>

                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Tickets</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Open</td>

                            <td>
                                {
                                    report.openTickets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                In Progress
                            </td>

                            <td>
                                {
                                    report.inProgressTickets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Resolved
                            </td>

                            <td>
                                {
                                    report.resolvedTickets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Closed
                            </td>

                            <td>
                                {
                                    report.closedTickets
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <hr />

            <section>
                <h2>
                    Tickets by Priority
                </h2>

                <table>
                    <thead>
                        <tr>
                            <th>
                                Priority
                            </th>

                            <th>
                                Tickets
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>
                                Critical
                            </td>

                            <td>
                                {
                                    report.criticalTickets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                High
                            </td>

                            <td>
                                {
                                    report.highTickets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Medium
                            </td>

                            <td>
                                {
                                    report.mediumTickets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Low
                            </td>

                            <td>
                                {
                                    report.lowTickets
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <hr />

            <section>
                <h2>
                    Asset Summary
                </h2>

                <p>
                    Total Assets:{" "}
                    <strong>
                        {assets.length}
                    </strong>
                </p>

                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Assets</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>
                                Available
                            </td>

                            <td>
                                {
                                    report.availableAssets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                In Use
                            </td>

                            <td>
                                {
                                    report.inUseAssets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Maintenance
                            </td>

                            <td>
                                {
                                    report.maintenanceAssets
                                }
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Retired
                            </td>

                            <td>
                                {
                                    report.retiredAssets
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
}