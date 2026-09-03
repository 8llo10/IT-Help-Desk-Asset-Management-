import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

type User = {
    id: number;
    fullName: string;
    email: string;
    role: string;
};

type Comment = {
    id: number;
    message: string;
    isInternal: boolean;
    createdAt: string;
    user: {
        id: number;
        fullName: string;
        role: string;
    };
};

type Ticket = {
    id: number;
    ticketNumber: string;
    title: string;
    description: string;
    priority: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

    slaDueAt?: string | null;
    resolvedAt?: string | null;
    closedAt?: string | null;
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
        brand?: string | null;
        model?: string | null;
    } | null;
};


type HistoryItem = {
    id: number;
    action: string;
    oldValue?: string | null;
    newValue?: string | null;
    createdAt: string;
    user: {
        id: number;
        fullName: string;
        role: string;
    };
};




export default function TicketDetailsPage() {
    const { id } = useParams();

    const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);

    const [selectedTechnician, setSelectedTechnician] =
        useState("");

    const [commentMessage, setCommentMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [history, setHistory] = useState<HistoryItem[]>([]);

    const fetchTicket = async () => {
        const response = await api.get("/tickets");

        const tickets: Ticket[] =
            response.data.data.tickets;

        const foundTicket = tickets.find(
            (item) => item.id === Number(id)
        );

        if (!foundTicket) {
            throw new Error("Ticket not found");
        }

        setTicket(foundTicket);
    };

    const fetchTechnicians = async () => {
        if (currentUser.role !== "ADMIN") {
            return;
        }

        const response = await api.get("/users");

        const users: User[] =
            response.data.data.users;

        setTechnicians(
            users.filter(
                (user) => user.role === "TECHNICIAN"
            )
        );
    };

    const fetchComments = async () => {
        const response = await api.get(
            `/tickets/${id}/comments`
        );

        setComments(
            response.data.data.comments
        );
    };

    const fetchHistory = async () => {
        const response = await api.get(
            `/tickets/${id}/history`
        );

        setHistory(
            response.data.data.history
        );
    };

    useEffect(() => {
        const loadPage = async () => {
            try {
                setLoading(true);
                setError("");

                await Promise.all([
                    fetchTicket(),
                    fetchTechnicians(),
                    fetchComments(),
                    fetchHistory(),
                ]);
            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load ticket"
                );
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [id]);

    const handleAssign = async () => {
        if (!selectedTechnician) {
            setError("Please select a technician");
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            await api.patch(
                `/tickets/${id}/assign`,
                {
                    technicianId:
                        Number(selectedTechnician),
                }
            );

            setMessage(
                "Technician assigned successfully"
            );

            await fetchTicket();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to assign technician"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async (
        status: string
    ) => {
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            await api.patch(
                `/tickets/${id}/status`,
                {
                    status,
                }
            );

            setMessage(
                "Ticket status updated successfully"
            );

            await fetchTicket();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to update ticket status"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddComment = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!commentMessage.trim()) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            await api.post(
                `/tickets/${id}/comments`,
                {
                    message: commentMessage.trim(),
                    isInternal,
                }
            );

            setCommentMessage("");
            setIsInternal(false);

            setMessage(
                "Comment added successfully"
            );

            await fetchComments();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to add comment"
            );
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <p>Loading ticket...</p>;
    }

    if (error && !ticket) {
        return <p>{error}</p>;
    }

    if (!ticket) {
        return <p>Ticket not found.</p>;
    }

    return (
        <div>
            <div>
                <h1>{ticket.ticketNumber}</h1>
                <h2>{ticket.title}</h2>
                <p>{ticket.description}</p>
            </div>

            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            <section>
                <h3>Ticket Information</h3>

                <p>
                    <strong>Status:</strong>{" "}
                    {ticket.status}
                </p>

                <p>
                    <strong>Priority:</strong>{" "}
                    {ticket.priority}
                </p>

                <p>
                    <strong>Category:</strong>{" "}
                    {ticket.category?.name}
                </p>

                <p>
                    <strong>Created By:</strong>{" "}
                    {ticket.createdBy?.fullName || "-"}
                </p>

                <p>
                    <strong>Assigned To:</strong>{" "}
                    {ticket.assignedTo?.fullName ||
                        "Unassigned"}
                </p>

                <p>
                    <strong>Asset:</strong>{" "}
                    {ticket.asset
                        ? `${ticket.asset.assetTag} - ${ticket.asset.type}`
                        : "No asset"}
                </p>

                <p>
                    <strong>SLA Due:</strong>{" "}
                    {ticket.slaDueAt
                        ? new Date(
                            ticket.slaDueAt
                        ).toLocaleString()
                        : "-"}
                </p>
            </section>

            {currentUser.role === "ADMIN" && (
                <section>
                    <h3>Assign Technician</h3>

                    <select
                        value={selectedTechnician}
                        onChange={(e) =>
                            setSelectedTechnician(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            Select technician
                        </option>

                        {technicians.map(
                            (technician) => (
                                <option
                                    key={technician.id}
                                    value={technician.id}
                                >
                                    {technician.fullName}
                                </option>
                            )
                        )}
                    </select>

                    <button
                        onClick={handleAssign}
                        disabled={
                            actionLoading ||
                            !selectedTechnician
                        }
                    >
                        Assign
                    </button>
                </section>
            )}

            <section>
                <h3>Ticket Actions</h3>

                {ticket.status === "OPEN" &&
                    (currentUser.role === "ADMIN" ||
                        currentUser.role ===
                        "TECHNICIAN") && (
                        <button
                            onClick={() =>
                                handleStatusChange(
                                    "IN_PROGRESS"
                                )
                            }
                            disabled={actionLoading}
                        >
                            Start Progress
                        </button>
                    )}

                {ticket.status ===
                    "IN_PROGRESS" &&
                    (currentUser.role === "ADMIN" ||
                        currentUser.role ===
                        "TECHNICIAN") && (
                        <button
                            onClick={() =>
                                handleStatusChange(
                                    "RESOLVED"
                                )
                            }
                            disabled={actionLoading}
                        >
                            Resolve Ticket
                        </button>
                    )}

                {ticket.status === "RESOLVED" &&
                    (currentUser.role === "ADMIN" ||
                        currentUser.id ===
                        ticket.createdBy?.id) && (
                        <button
                            onClick={() =>
                                handleStatusChange(
                                    "CLOSED"
                                )
                            }
                            disabled={actionLoading}
                        >
                            Close Ticket
                        </button>
                    )}

                {ticket.status === "CLOSED" && (
                    <p>This ticket is closed.</p>
                )}
            </section>

            <section>
                <h3>Comments</h3>

                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    <div>
                        {comments.map((comment) => (
                            <div key={comment.id}>
                                <strong>
                                    {comment.user.fullName}
                                </strong>

                                <span>
                                    {" "}
                                    ({comment.user.role})
                                </span>

                                {comment.isInternal && (
                                    <strong>
                                        {" "}
                                        [Internal Note]
                                    </strong>
                                )}

                                <p>{comment.message}</p>

                                <small>
                                    {new Date(
                                        comment.createdAt
                                    ).toLocaleString()}
                                </small>

                                <hr />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3>Ticket History</h3>

                {history.length === 0 ? (
                    <p>No history yet.</p>
                ) : (
                    <div>
                        {history.map((item) => (
                            <div key={item.id}>
                                <strong>{item.action}</strong>

                                <p>
                                    By: {item.user.fullName} ({item.user.role})
                                </p>

                                {item.oldValue && (
                                    <p>
                                        From: {item.oldValue}
                                    </p>
                                )}

                                {item.newValue && (
                                    <p>
                                        To: {item.newValue}
                                    </p>
                                )}

                                <small>
                                    {new Date(
                                        item.createdAt
                                    ).toLocaleString()}
                                </small>

                                <hr />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3>Add Comment</h3>

                <form onSubmit={handleAddComment}>
                    <textarea
                        value={commentMessage}
                        onChange={(e) =>
                            setCommentMessage(
                                e.target.value
                            )
                        }
                        placeholder="Write a comment..."
                        required
                    />

                    {(currentUser.role === "ADMIN" ||
                        currentUser.role ===
                        "TECHNICIAN") && (
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isInternal}
                                    onChange={(e) =>
                                        setIsInternal(
                                            e.target.checked
                                        )
                                    }
                                />

                                Internal Note
                            </label>
                        )}

                    <button
                        type="submit"
                        disabled={actionLoading}
                    >
                        {actionLoading
                            ? "Saving..."
                            : "Add Comment"}
                    </button>
                </form>
            </section>
        </div>
    );
}