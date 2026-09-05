import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

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

export default function TicketsPage() {
    const { user } = useAuth();

    const [tickets, setTickets] =
        useState<Ticket[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
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

    const fetchTickets = async () => {
        try {
            setError("");

            const response =
                await api.get("/tickets");

            const data =
                response.data?.data?.tickets ??
                response.data?.data ??
                [];

            setTickets(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load tickets"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchTickets();
    }, []);

    const filteredTickets =
        useMemo(() => {
            const query =
                search.trim().toLowerCase();

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

    if (loading) {
        return (
            <p>
                Loading tickets...
            </p>
        );
    }

    return (
        <div>
            <div>
                <h1>Tickets</h1>

                <p>
                    Manage and track IT
                    support requests.
                </p>

                <p>
                    Total: {tickets.length}
                </p>

                {(user?.role ===
                    "EMPLOYEE" ||
                    user?.role ===
                    "ADMIN") && (
                        <Link to="/tickets/new">
                            + New Ticket
                        </Link>
                    )}
            </div>

            {error && (
                <p>{error}</p>
            )}

            <div>
                <input
                    type="search"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
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

                <select
                    value={priorityFilter}
                    onChange={(event) =>
                        setPriorityFilter(
                            event.target.value
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

            <hr />

            {filteredTickets.length ===
                0 ? (
                <p>
                    No tickets found.
                </p>
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
                            <th>Asset</th>
                            <th>SLA Due</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTickets.map(
                            (ticket) => (
                                <tr key={ticket.id}>
                                    <td>
                                        <Link
                                            to={`/tickets/${ticket.id}`}
                                        >
                                            {
                                                ticket.ticketNumber
                                            }
                                        </Link>
                                    </td>

                                    <td>
                                        {ticket.title}
                                    </td>

                                    <td>
                                        {ticket.category
                                            ?.name ?? "—"}
                                    </td>

                                    <td>
                                        {
                                            ticket.priority
                                        }
                                    </td>

                                    <td>
                                        {ticket.status}
                                    </td>

                                    <td>
                                        {ticket.createdBy
                                            ?.fullName ?? "—"}
                                    </td>

                                    <td>
                                        {ticket.assignedTo
                                            ?.fullName ??
                                            "Unassigned"}
                                    </td>

                                    <td>
                                        {ticket.asset
                                            ? `${ticket.asset.assetTag} - ${ticket.asset.type}`
                                            : "—"}
                                    </td>

                                    <td>
                                        {ticket.slaDueAt
                                            ? new Date(
                                                ticket.slaDueAt
                                            ).toLocaleString()
                                            : "—"}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}