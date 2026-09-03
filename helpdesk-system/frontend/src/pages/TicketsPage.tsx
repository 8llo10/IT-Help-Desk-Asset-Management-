import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

type Ticket = {
    id: number;
    ticketNumber: string;
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

    slaDueAt?: string | null;
    createdAt: string;

    category: {
        id: number;
        name: string;
    };

    createdBy?: {
        id: number;
        fullName: string;
        email: string;
    };

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
};

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setError("");

                const response = await api.get("/tickets");

                setTickets(response.data.data.tickets);
            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load tickets"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) {
        return <p>Loading tickets...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <div>
                <h1>Tickets</h1>
                <p>Manage and track IT support requests.</p>

                <Link to="/tickets/new">
                    + New Ticket
                </Link>
            </div>

            {tickets.length === 0 ? (
                <p>No tickets found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Ticket</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th>Assigned To</th>
                            <th>SLA Due</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>{ticket.ticketNumber}</td>

                                <td>{ticket.title}</td>

                                <td>
                                    {ticket.category?.name || "-"}
                                </td>

                                <td>{ticket.priority}</td>

                                <td>{ticket.status}</td>

                                <td>
                                    {ticket.createdBy?.fullName || "-"}
                                </td>

                                <td>
                                    {ticket.assignedTo?.fullName ||
                                        "Unassigned"}
                                </td>

                                <td>
                                    {ticket.slaDueAt
                                        ? new Date(
                                            ticket.slaDueAt
                                        ).toLocaleString()
                                        : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}