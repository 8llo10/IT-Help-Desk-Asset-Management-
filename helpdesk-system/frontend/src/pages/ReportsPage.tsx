import { useEffect, useState } from "react";
import api from "../api/client";

type Ticket = {
    id: number;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    slaDueAt?: string | null;
    resolvedAt?: string | null;
    createdAt: string;
};

type Asset = {
    id: number;
    status:
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";
    type: string;
};

export default function ReportsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setError("");

                const [ticketsResponse, assetsResponse] =
                    await Promise.all([
                        api.get("/tickets"),
                        api.get("/assets"),
                    ]);

                setTickets(
                    ticketsResponse.data.data.tickets || []
                );

                setAssets(
                    assetsResponse.data.data.assets || []
                );
            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load reports"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const openTickets = tickets.filter(
        (ticket) => ticket.status === "OPEN"
    ).length;

    const inProgressTickets = tickets.filter(
        (ticket) => ticket.status === "IN_PROGRESS"
    ).length;

    const resolvedTickets = tickets.filter(
        (ticket) => ticket.status === "RESOLVED"
    ).length;

    const closedTickets = tickets.filter(
        (ticket) => ticket.status === "CLOSED"
    ).length;

    const criticalTickets = tickets.filter(
        (ticket) => ticket.priority === "CRITICAL"
    ).length;

    const highTickets = tickets.filter(
        (ticket) => ticket.priority === "HIGH"
    ).length;

    const mediumTickets = tickets.filter(
        (ticket) => ticket.priority === "MEDIUM"
    ).length;

    const lowTickets = tickets.filter(
        (ticket) => ticket.priority === "LOW"
    ).length;

    const availableAssets = assets.filter(
        (asset) => asset.status === "AVAILABLE"
    ).length;

    const inUseAssets = assets.filter(
        (asset) => asset.status === "IN_USE"
    ).length;

    const maintenanceAssets = assets.filter(
        (asset) => asset.status === "MAINTENANCE"
    ).length;

    const retiredAssets = assets.filter(
        (asset) => asset.status === "RETIRED"
    ).length;

    const overdueTickets = tickets.filter((ticket) => {
        if (!ticket.slaDueAt) {
            return false;
        }

        if (
            ticket.status === "RESOLVED" ||
            ticket.status === "CLOSED"
        ) {
            return false;
        }

        return new Date(ticket.slaDueAt) < new Date();
    }).length;

    const completionRate =
        tickets.length === 0
            ? 0
            : Math.round(
                ((resolvedTickets + closedTickets) /
                    tickets.length) *
                100
            );

    if (loading) {
        return <p>Loading reports...</p>;
    }

    return (
        <div>
            <div>
                <h1>Reports</h1>

                <p>
                    IT support performance and asset
                    management overview.
                </p>
            </div>

            {error && <p>{error}</p>}

            <section>
                <h2>Support Performance</h2>

                <div>
                    <div>
                        <h3>Total Tickets</h3>
                        <strong>{tickets.length}</strong>
                    </div>

                    <div>
                        <h3>Completed</h3>
                        <strong>
                            {resolvedTickets + closedTickets}
                        </strong>
                    </div>

                    <div>
                        <h3>Overdue SLA</h3>
                        <strong>{overdueTickets}</strong>
                    </div>

                    <div>
                        <h3>Completion Rate</h3>
                        <strong>{completionRate}%</strong>
                    </div>
                </div>
            </section>

            <section>
                <h2>Tickets by Status</h2>

                <div>
                    <p>
                        Open: <strong>{openTickets}</strong>
                    </p>

                    <p>
                        In Progress:{" "}
                        <strong>{inProgressTickets}</strong>
                    </p>

                    <p>
                        Resolved:{" "}
                        <strong>{resolvedTickets}</strong>
                    </p>

                    <p>
                        Closed:{" "}
                        <strong>{closedTickets}</strong>
                    </p>
                </div>
            </section>

            <section>
                <h2>Tickets by Priority</h2>

                <div>
                    <p>
                        Critical:{" "}
                        <strong>{criticalTickets}</strong>
                    </p>

                    <p>
                        High: <strong>{highTickets}</strong>
                    </p>

                    <p>
                        Medium:{" "}
                        <strong>{mediumTickets}</strong>
                    </p>

                    <p>
                        Low: <strong>{lowTickets}</strong>
                    </p>
                </div>
            </section>

            <section>
                <h2>Asset Summary</h2>

                <div>
                    <p>
                        Total Assets:{" "}
                        <strong>{assets.length}</strong>
                    </p>

                    <p>
                        Available:{" "}
                        <strong>{availableAssets}</strong>
                    </p>

                    <p>
                        In Use:{" "}
                        <strong>{inUseAssets}</strong>
                    </p>

                    <p>
                        Maintenance:{" "}
                        <strong>{maintenanceAssets}</strong>
                    </p>

                    <p>
                        Retired:{" "}
                        <strong>{retiredAssets}</strong>
                    </p>
                </div>
            </section>
        </div>
    );
}