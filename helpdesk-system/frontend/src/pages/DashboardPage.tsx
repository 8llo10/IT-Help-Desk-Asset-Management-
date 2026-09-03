import { useEffect, useState } from "react";
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
    priority: string;
    status: string;
    createdBy: {
        id: number;
        fullName: string;
    };
    assignedTo?: {
        id: number;
        fullName: string;
    } | null;
};

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [statsResponse, recentResponse] = await Promise.all([
                    api.get("/dashboard/stats"),
                    api.get("/dashboard/recent-tickets"),
                ]);

                setStats(statsResponse.data.data);
                setRecentTickets(
                    recentResponse.data.data.tickets
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

        fetchDashboard();
    }, []);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!stats) {
        return <p>No dashboard data available.</p>;
    }

    return (
        <div>
            <div>
                <h1>Dashboard</h1>
                <p>Welcome back, {user.fullName}</p>
            </div>

            <section>
                <h2>Tickets</h2>

                <div>
                    <p>Total: {stats.tickets.total}</p>
                    <p>Open: {stats.tickets.open}</p>
                    <p>In Progress: {stats.tickets.inProgress}</p>
                    <p>Resolved: {stats.tickets.resolved}</p>
                    <p>Closed: {stats.tickets.closed}</p>
                    <p>Critical: {stats.tickets.critical}</p>
                    <p>High: {stats.tickets.high}</p>
                    <p>SLA Breached: {stats.tickets.slaBreached}</p>
                </div>
            </section>

            <section>
                <h2>Assets</h2>

                <div>
                    <p>Total: {stats.assets.total}</p>
                    <p>Available: {stats.assets.available}</p>
                    <p>Maintenance: {stats.assets.maintenance}</p>
                </div>
            </section>

            <section>
                <h2>Users</h2>

                <p>Active Users: {stats.users.totalActive}</p>
            </section>

            <section>
                <h2>Recent Tickets</h2>

                {recentTickets.length === 0 ? (
                    <p>No recent tickets.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Title</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th>Assigned To</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentTickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td>{ticket.ticketNumber}</td>
                                    <td>{ticket.title}</td>
                                    <td>{ticket.priority}</td>
                                    <td>{ticket.status}</td>
                                    <td>{ticket.createdBy.fullName}</td>
                                    <td>
                                        {ticket.assignedTo?.fullName || "Unassigned"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}