import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

type TicketStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    isActive?: boolean;
}

interface Comment {
    id: number;
    message: string;
    isInternal: boolean;
    createdAt: string;

    user: {
        id: number;
        fullName: string;
        role: string;
    };
}

interface HistoryItem {
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
}

interface Attachment {
    id: number;

    originalName?: string;
    fileName?: string;
    filename?: string;
    name?: string;

    mimeType?: string;
    size?: number;

    createdAt?: string;

    uploadedBy?: {
        id: number;
        fullName: string;
    } | null;
}

interface Ticket {
    id: number;
    ticketNumber: string;

    title: string;
    description: string;

    priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

    status: TicketStatus;

    slaDueAt?: string | null;
    resolvedAt?: string | null;
    closedAt?: string | null;

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
        brand?: string | null;
        model?: string | null;
    } | null;
}

export default function TicketDetailsPage() {
    const { id } =
        useParams();

    const { user: currentUser } =
        useAuth();

    const ticketId =
        Number(id);

    const [ticket, setTicket] =
        useState<Ticket | null>(null);

    const [
        technicians,
        setTechnicians,
    ] =
        useState<User[]>([]);

    const [
        comments,
        setComments,
    ] =
        useState<Comment[]>([]);

    const [
        history,
        setHistory,
    ] =
        useState<HistoryItem[]>([]);

    const [
        attachments,
        setAttachments,
    ] =
        useState<Attachment[]>([]);

    const [
        selectedTechnician,
        setSelectedTechnician,
    ] =
        useState("");

    const [
        commentMessage,
        setCommentMessage,
    ] =
        useState("");

    const [
        isInternal,
        setIsInternal,
    ] =
        useState(false);

    const [
        selectedFile,
        setSelectedFile,
    ] =
        useState<File | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [
        actionLoading,
        setActionLoading,
    ] =
        useState(false);

    const [
        uploadLoading,
        setUploadLoading,
    ] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const fetchTicket =
        useCallback(async () => {
            const response =
                await api.get("/tickets");

            const data =
                response.data?.data
                    ?.tickets ??
                response.data?.data ??
                [];

            const tickets: Ticket[] =
                Array.isArray(data)
                    ? data
                    : [];

            const foundTicket =
                tickets.find(
                    (item) =>
                        item.id === ticketId
                );

            if (!foundTicket) {
                throw new Error(
                    "Ticket not found"
                );
            }

            setTicket(foundTicket);

            if (
                foundTicket.assignedTo
                    ?.id
            ) {
                setSelectedTechnician(
                    String(
                        foundTicket
                            .assignedTo.id
                    )
                );
            }
        }, [ticketId]);

    const fetchTechnicians =
        useCallback(async () => {
            if (
                currentUser?.role !==
                "ADMIN"
            ) {
                return;
            }

            const response =
                await api.get("/users");

            const data =
                response.data?.data
                    ?.users ??
                response.data?.data ??
                [];

            const users: User[] =
                Array.isArray(data)
                    ? data
                    : [];

            setTechnicians(
                users.filter(
                    (user) =>
                        user.role ===
                        "TECHNICIAN" &&
                        user.isActive !== false
                )
            );
        }, [currentUser?.role]);

    const fetchComments =
        useCallback(async () => {
            const response =
                await api.get(
                    `/tickets/${ticketId}/comments`
                );

            const data =
                response.data?.data
                    ?.comments ??
                response.data?.data ??
                [];

            setComments(
                Array.isArray(data)
                    ? data
                    : []
            );
        }, [ticketId]);

    const fetchHistory =
        useCallback(async () => {
            const response =
                await api.get(
                    `/tickets/${ticketId}/history`
                );

            const data =
                response.data?.data
                    ?.history ??
                response.data?.data ??
                [];

            setHistory(
                Array.isArray(data)
                    ? data
                    : []
            );
        }, [ticketId]);

    const fetchAttachments =
        useCallback(async () => {
            const response =
                await api.get(
                    `/attachments/tickets/${ticketId}`
                );

            const data =
                response.data?.data
                    ?.attachments ??
                response.data?.data ??
                [];

            setAttachments(
                Array.isArray(data)
                    ? data
                    : []
            );
        }, [ticketId]);

    useEffect(() => {
        const loadPage = async () => {
            if (
                !Number.isFinite(
                    ticketId
                )
            ) {
                setError(
                    "Invalid ticket ID."
                );

                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                await Promise.all([
                    fetchTicket(),
                    fetchTechnicians(),
                    fetchComments(),
                    fetchHistory(),
                    fetchAttachments(),
                ]);
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    error.message ??
                    "Failed to load ticket"
                );
            } finally {
                setLoading(false);
            }
        };

        void loadPage();
    }, [
        ticketId,
        fetchTicket,
        fetchTechnicians,
        fetchComments,
        fetchHistory,
        fetchAttachments,
    ]);

    const handleAssign =
        async () => {
            if (
                !selectedTechnician
            ) {
                setError(
                    "Please select a technician."
                );

                return;
            }

            try {
                setActionLoading(true);
                setError("");
                setMessage("");

                await api.patch(
                    `/tickets/${ticketId}/assign`,
                    {
                        technicianId:
                            Number(
                                selectedTechnician
                            ),
                    }
                );

                setMessage(
                    "Technician assigned successfully."
                );

                await Promise.all([
                    fetchTicket(),
                    fetchHistory(),
                ]);
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to assign technician"
                );
            } finally {
                setActionLoading(false);
            }
        };

    const handleStatusChange =
        async (
            status: TicketStatus
        ) => {
            try {
                setActionLoading(true);
                setError("");
                setMessage("");

                await api.patch(
                    `/tickets/${ticketId}/status`,
                    {
                        status,
                    }
                );

                setMessage(
                    "Ticket status updated successfully."
                );

                await Promise.all([
                    fetchTicket(),
                    fetchHistory(),
                ]);
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to update ticket status"
                );
            } finally {
                setActionLoading(false);
            }
        };

    const handleAddComment =
        async (
            event: React.FormEvent
        ) => {
            event.preventDefault();

            if (
                !commentMessage.trim()
            ) {
                return;
            }

            try {
                setActionLoading(true);
                setError("");
                setMessage("");

                await api.post(
                    `/tickets/${ticketId}/comments`,
                    {
                        message:
                            commentMessage.trim(),

                        isInternal,
                    }
                );

                setCommentMessage("");
                setIsInternal(false);

                setMessage(
                    isInternal
                        ? "Internal note added successfully."
                        : "Comment added successfully."
                );

                await Promise.all([
                    fetchComments(),
                    fetchHistory(),
                ]);
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to add comment"
                );
            } finally {
                setActionLoading(false);
            }
        };

    const handleUpload =
        async () => {
            if (!selectedFile) {
                setError(
                    "Please select a file."
                );

                return;
            }

            try {
                setUploadLoading(true);
                setError("");
                setMessage("");

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    selectedFile
                );

                await api.post(
                    `/attachments/tickets/${ticketId}`,
                    formData
                );

                setSelectedFile(null);

                setMessage(
                    "Attachment uploaded successfully."
                );

                await fetchAttachments();
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to upload attachment"
                );
            } finally {
                setUploadLoading(false);
            }
        };

    const handleDownload =
        async (
            attachment: Attachment
        ) => {
            try {
                setError("");

                const response =
                    await api.get(
                        `/attachments/${attachment.id}`,
                        {
                            responseType:
                                "blob",
                        }
                    );

                const url =
                    window.URL.createObjectURL(
                        response.data
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href = url;

                link.download =
                    attachment.originalName ??
                    attachment.fileName ??
                    attachment.filename ??
                    attachment.name ??
                    `attachment-${attachment.id}`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to download attachment"
                );
            }
        };

    const handleDeleteAttachment =
        async (
            attachmentId: number
        ) => {
            try {
                setActionLoading(true);
                setError("");
                setMessage("");

                await api.delete(
                    `/attachments/${attachmentId}`
                );

                setMessage(
                    "Attachment deleted successfully."
                );

                await fetchAttachments();
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to delete attachment"
                );
            } finally {
                setActionLoading(false);
            }
        };

    if (loading) {
        return (
            <p>
                Loading ticket...
            </p>
        );
    }

    if (error && !ticket) {
        return (
            <div>
                <p>{error}</p>

                <Link to="/tickets">
                    Back to Tickets
                </Link>
            </div>
        );
    }

    if (!ticket) {
        return (
            <p>
                Ticket not found.
            </p>
        );
    }

    const canManageWorkflow =
        currentUser?.role ===
        "ADMIN" ||
        currentUser?.role ===
        "TECHNICIAN";

    const canUseInternalNotes =
        currentUser?.role ===
        "ADMIN" ||
        currentUser?.role ===
        "TECHNICIAN";

    const canCloseTicket =
        currentUser?.role ===
        "ADMIN" ||
        currentUser?.id ===
        ticket.createdBy?.id;

    return (
        <div>
            <div>
                <Link to="/tickets">
                    ← Tickets
                </Link>

                <h1>
                    {ticket.ticketNumber}
                </h1>

                <h2>
                    {ticket.title}
                </h2>

                <p>
                    {ticket.description}
                </p>
            </div>

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            <section>
                <h3>
                    Ticket Information
                </h3>

                <p>
                    <strong>
                        Status:
                    </strong>{" "}
                    {ticket.status}
                </p>

                <p>
                    <strong>
                        Priority:
                    </strong>{" "}
                    {ticket.priority}
                </p>

                <p>
                    <strong>
                        Category:
                    </strong>{" "}
                    {ticket.category?.name ??
                        "—"}
                </p>

                <p>
                    <strong>
                        Created By:
                    </strong>{" "}
                    {ticket.createdBy
                        ?.fullName ?? "—"}
                </p>

                <p>
                    <strong>
                        Assigned To:
                    </strong>{" "}
                    {ticket.assignedTo
                        ?.fullName ??
                        "Unassigned"}
                </p>

                <p>
                    <strong>
                        Asset:
                    </strong>{" "}
                    {ticket.asset
                        ? `${ticket.asset.assetTag} - ${ticket.asset.type}`
                        : "No asset"}
                </p>

                <p>
                    <strong>
                        Created:
                    </strong>{" "}
                    {new Date(
                        ticket.createdAt
                    ).toLocaleString()}
                </p>

                <p>
                    <strong>
                        SLA Due:
                    </strong>{" "}
                    {ticket.slaDueAt
                        ? new Date(
                            ticket.slaDueAt
                        ).toLocaleString()
                        : "—"}
                </p>

                {ticket.resolvedAt && (
                    <p>
                        <strong>
                            Resolved:
                        </strong>{" "}
                        {new Date(
                            ticket.resolvedAt
                        ).toLocaleString()}
                    </p>
                )}

                {ticket.closedAt && (
                    <p>
                        <strong>
                            Closed:
                        </strong>{" "}
                        {new Date(
                            ticket.closedAt
                        ).toLocaleString()}
                    </p>
                )}
            </section>

            {currentUser?.role ===
                "ADMIN" && (
                    <section>
                        <h3>
                            Assign Technician
                        </h3>

                        <select
                            value={
                                selectedTechnician
                            }
                            disabled={
                                actionLoading
                            }
                            onChange={(event) =>
                                setSelectedTechnician(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Select Technician
                            </option>

                            {technicians.map(
                                (technician) => (
                                    <option
                                        key={
                                            technician.id
                                        }
                                        value={
                                            technician.id
                                        }
                                    >
                                        {
                                            technician.fullName
                                        }{" "}
                                        ({technician.email})
                                    </option>
                                )
                            )}
                        </select>

                        <button
                            type="button"
                            onClick={() =>
                                void handleAssign()
                            }
                            disabled={
                                actionLoading ||
                                !selectedTechnician
                            }
                        >
                            {actionLoading
                                ? "Assigning..."
                                : "Assign"}
                        </button>
                    </section>
                )}

            <section>
                <h3>
                    Ticket Actions
                </h3>

                {ticket.status ===
                    "OPEN" &&
                    canManageWorkflow && (
                        <button
                            type="button"
                            disabled={
                                actionLoading
                            }
                            onClick={() =>
                                void handleStatusChange(
                                    "IN_PROGRESS"
                                )
                            }
                        >
                            Start Progress
                        </button>
                    )}

                {ticket.status ===
                    "IN_PROGRESS" &&
                    canManageWorkflow && (
                        <button
                            type="button"
                            disabled={
                                actionLoading
                            }
                            onClick={() =>
                                void handleStatusChange(
                                    "RESOLVED"
                                )
                            }
                        >
                            Resolve Ticket
                        </button>
                    )}

                {ticket.status ===
                    "RESOLVED" &&
                    canCloseTicket && (
                        <button
                            type="button"
                            disabled={
                                actionLoading
                            }
                            onClick={() =>
                                void handleStatusChange(
                                    "CLOSED"
                                )
                            }
                        >
                            Close Ticket
                        </button>
                    )}

                {ticket.status ===
                    "CLOSED" && (
                        <p>
                            This ticket is closed.
                        </p>
                    )}
            </section>

            <section>
                <h3>
                    Attachments
                </h3>

                <div>
                    <input
                        type="file"
                        disabled={
                            uploadLoading
                        }
                        onChange={(event) =>
                            setSelectedFile(
                                event.target
                                    .files?.[0] ??
                                null
                            )
                        }
                    />

                    <button
                        type="button"
                        disabled={
                            uploadLoading ||
                            !selectedFile
                        }
                        onClick={() =>
                            void handleUpload()
                        }
                    >
                        {uploadLoading
                            ? "Uploading..."
                            : "Upload File"}
                    </button>
                </div>

                {attachments.length ===
                    0 ? (
                    <p>
                        No attachments.
                    </p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>File</th>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Uploaded</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {attachments.map(
                                (attachment) => (
                                    <tr
                                        key={
                                            attachment.id
                                        }
                                    >
                                        <td>
                                            {attachment.originalName ??
                                                attachment.fileName ??
                                                attachment.filename ??
                                                attachment.name ??
                                                `Attachment ${attachment.id}`}
                                        </td>

                                        <td>
                                            {attachment.mimeType ??
                                                "—"}
                                        </td>

                                        <td>
                                            {attachment.size
                                                ? `${Math.round(
                                                    attachment.size /
                                                    1024
                                                )} KB`
                                                : "—"}
                                        </td>

                                        <td>
                                            {attachment.createdAt
                                                ? new Date(
                                                    attachment.createdAt
                                                ).toLocaleString()
                                                : "—"}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleDownload(
                                                        attachment
                                                    )
                                                }
                                            >
                                                Download
                                            </button>

                                            {(currentUser?.role ===
                                                "ADMIN" ||
                                                currentUser?.role ===
                                                "TECHNICIAN") && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            actionLoading
                                                        }
                                                        onClick={() =>
                                                            void handleDeleteAttachment(
                                                                attachment.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}
            </section>

            <section>
                <h3>
                    Comments
                </h3>

                {comments.length === 0 ? (
                    <p>
                        No comments yet.
                    </p>
                ) : (
                    <div>
                        {comments.map(
                            (comment) => (
                                <div
                                    key={
                                        comment.id
                                    }
                                >
                                    <strong>
                                        {
                                            comment.user
                                                .fullName
                                        }
                                    </strong>

                                    <span>
                                        {" "}
                                        (
                                        {
                                            comment.user
                                                .role
                                        }
                                        )
                                    </span>

                                    {comment.isInternal && (
                                        <strong>
                                            {" "}
                                            [Internal Note]
                                        </strong>
                                    )}

                                    <p>
                                        {
                                            comment.message
                                        }
                                    </p>

                                    <small>
                                        {new Date(
                                            comment.createdAt
                                        ).toLocaleString()}
                                    </small>

                                    <hr />
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>

            <section>
                <h3>
                    Add Comment
                </h3>

                <form
                    onSubmit={
                        handleAddComment
                    }
                >
                    <textarea
                        value={
                            commentMessage
                        }
                        disabled={
                            actionLoading
                        }
                        placeholder="Write a comment..."
                        required
                        onChange={(event) =>
                            setCommentMessage(
                                event.target.value
                            )
                        }
                    />

                    {canUseInternalNotes && (
                        <label>
                            <input
                                type="checkbox"
                                checked={
                                    isInternal
                                }
                                disabled={
                                    actionLoading
                                }
                                onChange={(event) =>
                                    setIsInternal(
                                        event.target.checked
                                    )
                                }
                            />

                            Internal Note
                        </label>
                    )}

                    <button
                        type="submit"
                        disabled={
                            actionLoading ||
                            !commentMessage.trim()
                        }
                    >
                        {actionLoading
                            ? "Saving..."
                            : isInternal
                                ? "Add Internal Note"
                                : "Add Comment"}
                    </button>
                </form>
            </section>

            <section>
                <h3>
                    Ticket History
                </h3>

                {history.length === 0 ? (
                    <p>
                        No history yet.
                    </p>
                ) : (
                    <div>
                        {history.map(
                            (item) => (
                                <div
                                    key={item.id}
                                >
                                    <strong>
                                        {item.action}
                                    </strong>

                                    <p>
                                        By:{" "}
                                        {
                                            item.user
                                                .fullName
                                        }{" "}
                                        (
                                        {
                                            item.user
                                                .role
                                        }
                                        )
                                    </p>

                                    {item.oldValue && (
                                        <p>
                                            From:{" "}
                                            {
                                                item.oldValue
                                            }
                                        </p>
                                    )}

                                    {item.newValue && (
                                        <p>
                                            To:{" "}
                                            {
                                                item.newValue
                                            }
                                        </p>
                                    )}

                                    <small>
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleString()}
                                    </small>

                                    <hr />
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}