import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    AlertTriangle,
    ArrowLeft,
    BadgeCheck,
    Building2,
    Check,
    CheckCircle2,
    CircleDot,
    Clock3,
    Download,
    File,
    FileText,
    HardDrive,
    History,
    LockKeyhole,
    MessageSquare,
    Paperclip,
    Play,
    Send,
    ShieldCheck,
    Tag,
    Trash2,
    Upload,
    User,
    UserCheck,
    UserRoundCog,
    Wrench,
    X,
} from "lucide-react";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

import "../styles/TicketDetailsPage.css";

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

interface UserItem {
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

    priority: TicketPriority;
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

const formatStatus = (
    status: TicketStatus
) => {
    switch (status) {
        case "OPEN":
            return "Open";

        case "IN_PROGRESS":
            return "In Progress";

        case "RESOLVED":
            return "Resolved";

        case "CLOSED":
            return "Closed";
    }
};

const formatPriority = (
    priority: TicketPriority
) => {
    return (
        priority.charAt(0) +
        priority
            .slice(1)
            .toLowerCase()
    );
};

const formatRole = (
    role?: string
) => {
    switch (role) {
        case "ADMIN":
            return "Administrator";

        case "TECHNICIAN":
            return "IT Technician";

        case "EMPLOYEE":
            return "Employee";

        default:
            return role || "—";
    }
};

const getAttachmentName = (
    attachment: Attachment
) =>
    attachment.originalName ??
    attachment.fileName ??
    attachment.filename ??
    attachment.name ??
    `Attachment ${attachment.id}`;

export default function TicketDetailsPage() {
    const {
        id,
    } =
        useParams();

    const {
        user: currentUser,
    } =
        useAuth();

    const ticketId =
        Number(id);

    const [
        ticket,
        setTicket,
    ] =
        useState<Ticket | null>(
            null
        );

    const [
        technicians,
        setTechnicians,
    ] =
        useState<UserItem[]>([]);

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
        useState<File | null>(
            null
        );

    const [
        loading,
        setLoading,
    ] =
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

    const [
        error,
        setError,
    ] =
        useState("");

    const [
        message,
        setMessage,
    ] =
        useState("");

    /* =========================================================
       FETCH TICKET
       ========================================================= */

    const fetchTicket =
        useCallback(
            async () => {
                const response =
                    await api.get(
                        "/tickets"
                    );

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
                            item.id ===
                            ticketId
                    );

                if (!foundTicket) {
                    throw new Error(
                        "Ticket not found"
                    );
                }

                setTicket(
                    foundTicket
                );

                if (
                    foundTicket
                        .assignedTo?.id
                ) {
                    setSelectedTechnician(
                        String(
                            foundTicket
                                .assignedTo.id
                        )
                    );
                } else {
                    setSelectedTechnician(
                        ""
                    );
                }
            },
            [
                ticketId,
            ]
        );

    /* =========================================================
       FETCH TECHNICIANS
       ========================================================= */

    const fetchTechnicians =
        useCallback(
            async () => {
                if (
                    currentUser?.role !==
                    "ADMIN"
                ) {
                    return;
                }

                const response =
                    await api.get(
                        "/users"
                    );

                const data =
                    response.data?.data
                        ?.users ??
                    response.data?.data ??
                    [];

                const users: UserItem[] =
                    Array.isArray(data)
                        ? data
                        : [];

                setTechnicians(
                    users.filter(
                        (user) =>
                            user.role ===
                            "TECHNICIAN" &&
                            user.isActive !==
                            false
                    )
                );
            },
            [
                currentUser?.role,
            ]
        );

    /* =========================================================
       FETCH COMMENTS
       ========================================================= */

    const fetchComments =
        useCallback(
            async () => {
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
            },
            [
                ticketId,
            ]
        );

    /* =========================================================
       FETCH HISTORY
       ========================================================= */

    const fetchHistory =
        useCallback(
            async () => {
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
            },
            [
                ticketId,
            ]
        );

    /* =========================================================
       FETCH ATTACHMENTS
       ========================================================= */

    const fetchAttachments =
        useCallback(
            async () => {
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
            },
            [
                ticketId,
            ]
        );

    /* =========================================================
       INITIAL LOAD
       ========================================================= */

    useEffect(() => {
        const loadPage =
            async () => {
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
                } catch (
                error: any
                ) {
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

    /* =========================================================
       ASSIGN TECHNICIAN
       ========================================================= */

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
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to assign technician"
                );
            } finally {
                setActionLoading(false);
            }
        };

    /* =========================================================
       STATUS
       ========================================================= */

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
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to update ticket status"
                );
            } finally {
                setActionLoading(false);
            }
        };

    /* =========================================================
       COMMENT
       ========================================================= */

    const handleAddComment =
        async (
            event: FormEvent
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
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to add comment"
                );
            } finally {
                setActionLoading(false);
            }
        };

    /* =========================================================
       UPLOAD
       ========================================================= */

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

                setSelectedFile(
                    null
                );

                setMessage(
                    "Attachment uploaded successfully."
                );

                await fetchAttachments();
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to upload attachment"
                );
            } finally {
                setUploadLoading(false);
            }
        };

    /* =========================================================
       DOWNLOAD
       ========================================================= */

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
                    window.URL
                        .createObjectURL(
                            response.data
                        );

                const link =
                    document
                        .createElement(
                            "a"
                        );

                link.href = url;

                link.download =
                    getAttachmentName(
                        attachment
                    );

                document.body
                    .appendChild(
                        link
                    );

                link.click();
                link.remove();

                window.URL
                    .revokeObjectURL(
                        url
                    );
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to download attachment"
                );
            }
        };

    /* =========================================================
       DELETE ATTACHMENT
       ========================================================= */

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
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to delete attachment"
                );
            } finally {
                setActionLoading(false);
            }
        };

    /* =========================================================
       LOADING / EMPTY
       ========================================================= */

    if (loading) {
        return (
            <div className="ticket-details-loading">

                <div className="ticket-details-loading-icon">
                    <TicketStatusIcon
                        status="OPEN"
                    />
                </div>

                <strong>
                    Loading ticket
                </strong>

                <p>
                    Preparing ticket workspace...
                </p>

            </div>
        );
    }

    if (
        error &&
        !ticket
    ) {
        return (
            <div className="ticket-details-not-found">

                <div className="ticket-details-not-found-icon">
                    <AlertTriangle
                        size={25}
                    />
                </div>

                <h2>
                    Ticket unavailable
                </h2>

                <p>
                    {error}
                </p>

                <Link
                    to="/tickets"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Back to Tickets
                </Link>

            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="ticket-details-not-found">

                <h2>
                    Ticket not found
                </h2>

                <Link
                    to="/tickets"
                >
                    Back to Tickets
                </Link>

            </div>
        );
    }

    /* =========================================================
       PERMISSION HELPERS
       ========================================================= */

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

    const canDeleteAttachments =
        currentUser?.role ===
        "ADMIN" ||
        currentUser?.role ===
        "TECHNICIAN";

    /* =========================================================
       DERIVED VALUES
       ========================================================= */

    const isSlaOverdue =
        useMemo(() => {
            if (
                !ticket.slaDueAt ||
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
        }, [
            ticket,
        ]);

    const commentCount =
        comments.length;

    const attachmentCount =
        attachments.length;

    const historyCount =
        history.length;

    return (
        <div className="ticket-details-page">

            {/* =====================================================
          TOP BAR
          ===================================================== */}

            <div className="ticket-details-topbar">

                <Link
                    to="/tickets"
                    className="ticket-details-back"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Tickets
                </Link>

                <span>
                    SUPPORT / TICKET WORKSPACE
                </span>

            </div>

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="ticket-details-hero">

                <div className="ticket-details-hero-main">

                    <div className="ticket-details-ticket-id">
                        <span>
                            SUPPORT TICKET
                        </span>

                        <strong>
                            {
                                ticket.ticketNumber
                            }
                        </strong>
                    </div>

                    <h1>
                        {ticket.title}
                    </h1>

                    <p>
                        {ticket.description}
                    </p>

                    <div className="ticket-details-hero-badges">

                        <span
                            className={`ticket-details-status status-${ticket.status.toLowerCase()}`}
                        >
                            <CircleDot
                                size={12}
                            />

                            {formatStatus(
                                ticket.status
                            )}
                        </span>

                        <span
                            className={`ticket-details-priority priority-${ticket.priority.toLowerCase()}`}
                        >
                            <AlertTriangle
                                size={12}
                            />

                            {formatPriority(
                                ticket.priority
                            )}{" "}
                            Priority
                        </span>

                        {ticket.category && (
                            <span className="ticket-details-category-badge">
                                <Tag
                                    size={12}
                                />

                                {
                                    ticket.category
                                        .name
                                }
                            </span>
                        )}

                    </div>

                </div>

                <div className="ticket-details-hero-summary">

                    <article>

                        <div className="ticket-details-hero-summary-icon">
                            <MessageSquare
                                size={16}
                            />
                        </div>

                        <span>
                            Comments
                        </span>

                        <strong>
                            {commentCount}
                        </strong>

                    </article>

                    <article>

                        <div className="ticket-details-hero-summary-icon ticket-details-hero-summary-icon-pink">
                            <Paperclip
                                size={16}
                            />
                        </div>

                        <span>
                            Files
                        </span>

                        <strong>
                            {attachmentCount}
                        </strong>

                    </article>

                    <article>

                        <div className="ticket-details-hero-summary-icon ticket-details-hero-summary-icon-green">
                            <History
                                size={16}
                            />
                        </div>

                        <span>
                            Events
                        </span>

                        <strong>
                            {historyCount}
                        </strong>

                    </article>

                </div>

            </section>

            {/* =====================================================
          ALERTS
          ===================================================== */}

            {message && (
                <div className="ticket-details-alert ticket-details-alert-success">

                    <CheckCircle2
                        size={16}
                    />

                    <span>
                        {message}
                    </span>

                </div>
            )}

            {error && (
                <div className="ticket-details-alert ticket-details-alert-error">

                    <X
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* =====================================================
          PRIMARY WORKSPACE
          ===================================================== */}

            <section className="ticket-details-primary-grid">

                {/* ===================================================
            TICKET INFORMATION
            =================================================== */}

                <article className="ticket-details-panel">

                    <div className="ticket-details-panel-header">

                        <div>

                            <span className="ticket-details-section-label">
                                TICKET RECORD
                            </span>

                            <h2>
                                Ticket Information
                            </h2>

                            <p>
                                Current request, ownership
                                and SLA information.
                            </p>

                        </div>

                        <div className="ticket-details-panel-icon">
                            <FileText
                                size={18}
                            />
                        </div>

                    </div>

                    <div className="ticket-details-info-grid">

                        <InfoItem
                            icon={
                                <CircleDot
                                    size={16}
                                />
                            }
                            label="Status"
                            value={
                                formatStatus(
                                    ticket.status
                                )
                            }
                        />

                        <InfoItem
                            icon={
                                <AlertTriangle
                                    size={16}
                                />
                            }
                            label="Priority"
                            value={`${formatPriority(
                                ticket.priority
                            )} Priority`}
                        />

                        <InfoItem
                            icon={
                                <Tag
                                    size={16}
                                />
                            }
                            label="Category"
                            value={
                                ticket.category
                                    ?.name ??
                                "—"
                            }
                        />

                        <InfoItem
                            icon={
                                <User
                                    size={16}
                                />
                            }
                            label="Created By"
                            value={
                                ticket.createdBy
                                    ?.fullName ??
                                "—"
                            }
                        />

                        <InfoItem
                            icon={
                                <UserCheck
                                    size={16}
                                />
                            }
                            label="Assigned To"
                            value={
                                ticket.assignedTo
                                    ?.fullName ??
                                "Unassigned"
                            }
                        />

                        <InfoItem
                            icon={
                                <HardDrive
                                    size={16}
                                />
                            }
                            label="Asset"
                            value={
                                ticket.asset
                                    ? `${ticket.asset.assetTag} · ${ticket.asset.type}`
                                    : "No asset"
                            }
                        />

                        <InfoItem
                            icon={
                                <Clock3
                                    size={16}
                                />
                            }
                            label="Created"
                            value={
                                new Date(
                                    ticket.createdAt
                                ).toLocaleString()
                            }
                        />

                        <InfoItem
                            icon={
                                isSlaOverdue ? (
                                    <AlertTriangle
                                        size={16}
                                    />
                                ) : (
                                    <Clock3
                                        size={16}
                                    />
                                )
                            }
                            label="SLA Due"
                            value={
                                ticket.slaDueAt
                                    ? new Date(
                                        ticket.slaDueAt
                                    ).toLocaleString()
                                    : "—"
                            }
                            tone={
                                isSlaOverdue
                                    ? "warning"
                                    : undefined
                            }
                        />

                        {ticket.resolvedAt && (
                            <InfoItem
                                icon={
                                    <CheckCircle2
                                        size={16}
                                    />
                                }
                                label="Resolved"
                                value={
                                    new Date(
                                        ticket.resolvedAt
                                    ).toLocaleString()
                                }
                                tone="success"
                            />
                        )}

                        {ticket.closedAt && (
                            <InfoItem
                                icon={
                                    <BadgeCheck
                                        size={16}
                                    />
                                }
                                label="Closed"
                                value={
                                    new Date(
                                        ticket.closedAt
                                    ).toLocaleString()
                                }
                            />
                        )}

                    </div>

                    {ticket.asset && (
                        <div className="ticket-details-asset-strip">

                            <div className="ticket-details-asset-icon">
                                <HardDrive
                                    size={18}
                                />
                            </div>

                            <div>

                                <span>
                                    LINKED ASSET
                                </span>

                                <strong>
                                    {
                                        ticket.asset
                                            .assetTag
                                    }
                                </strong>

                                <p>
                                    {
                                        [
                                            ticket.asset
                                                .brand,
                                            ticket.asset
                                                .model,
                                            ticket.asset
                                                .type,
                                        ]
                                            .filter(
                                                Boolean
                                            )
                                            .join(
                                                " · "
                                            )
                                    }
                                </p>

                            </div>

                        </div>
                    )}

                </article>

                {/* ===================================================
            OPERATIONS
            =================================================== */}

                <aside className="ticket-details-operations">

                    {/* ASSIGN */}

                    {currentUser?.role ===
                        "ADMIN" && (
                            <section className="ticket-details-operation-card">

                                <div className="ticket-details-operation-heading">

                                    <div>
                                        <UserRoundCog
                                            size={17}
                                        />
                                    </div>

                                    <div>

                                        <span>
                                            OWNERSHIP
                                        </span>

                                        <h3>
                                            Assign Technician
                                        </h3>

                                    </div>

                                </div>

                                <div className="ticket-details-select-shell">

                                    <UserCheck
                                        size={15}
                                    />

                                    <select
                                        value={
                                            selectedTechnician
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSelectedTechnician(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select Technician
                                        </option>

                                        {technicians.map(
                                            (
                                                technician
                                            ) => (
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

                                </div>

                                <button
                                    type="button"
                                    className="ticket-details-action-button secondary"
                                    disabled={
                                        actionLoading ||
                                        !selectedTechnician
                                    }
                                    onClick={() =>
                                        void handleAssign()
                                    }
                                >
                                    <UserCheck
                                        size={15}
                                    />

                                    {actionLoading
                                        ? "Assigning..."
                                        : "Assign Technician"}
                                </button>

                            </section>
                        )}

                    {/* WORKFLOW */}

                    <section className="ticket-details-operation-card">

                        <div className="ticket-details-operation-heading">

                            <div>
                                <Wrench
                                    size={17}
                                />
                            </div>

                            <div>

                                <span>
                                    WORKFLOW
                                </span>

                                <h3>
                                    Ticket Actions
                                </h3>

                            </div>

                        </div>

                        <div className="ticket-details-current-state">

                            <span>
                                Current State
                            </span>

                            <strong>
                                {formatStatus(
                                    ticket.status
                                )}
                            </strong>

                        </div>

                        <div className="ticket-details-workflow-actions">

                            {ticket.status ===
                                "OPEN" &&
                                canManageWorkflow && (
                                    <button
                                        type="button"
                                        className="ticket-details-action-button primary"
                                        disabled={
                                            actionLoading
                                        }
                                        onClick={() =>
                                            void handleStatusChange(
                                                "IN_PROGRESS"
                                            )
                                        }
                                    >
                                        <Play
                                            size={15}
                                        />

                                        Start Progress
                                    </button>
                                )}

                            {ticket.status ===
                                "IN_PROGRESS" &&
                                canManageWorkflow && (
                                    <button
                                        type="button"
                                        className="ticket-details-action-button success"
                                        disabled={
                                            actionLoading
                                        }
                                        onClick={() =>
                                            void handleStatusChange(
                                                "RESOLVED"
                                            )
                                        }
                                    >
                                        <Check
                                            size={15}
                                        />

                                        Resolve Ticket
                                    </button>
                                )}

                            {ticket.status ===
                                "RESOLVED" &&
                                canCloseTicket && (
                                    <button
                                        type="button"
                                        className="ticket-details-action-button dark"
                                        disabled={
                                            actionLoading
                                        }
                                        onClick={() =>
                                            void handleStatusChange(
                                                "CLOSED"
                                            )
                                        }
                                    >
                                        <BadgeCheck
                                            size={15}
                                        />

                                        Close Ticket
                                    </button>
                                )}

                            {ticket.status ===
                                "CLOSED" && (
                                    <div className="ticket-details-closed-state">

                                        <CheckCircle2
                                            size={16}
                                        />

                                        <div>

                                            <strong>
                                                Ticket closed
                                            </strong>

                                            <span>
                                                No additional workflow
                                                action is available.
                                            </span>

                                        </div>

                                    </div>
                                )}

                            {ticket.status !==
                                "CLOSED" &&
                                !canManageWorkflow &&
                                !(
                                    ticket.status ===
                                    "RESOLVED" &&
                                    canCloseTicket
                                ) && (
                                    <div className="ticket-details-workflow-note">

                                        <LockKeyhole
                                            size={15}
                                        />

                                        <span>
                                            No workflow action is
                                            available for your
                                            current account role.
                                        </span>

                                    </div>
                                )}

                        </div>

                    </section>

                    {/* SLA */}

                    <section
                        className={`ticket-details-sla-card ${isSlaOverdue
                                ? "overdue"
                                : ""
                            }`}
                    >

                        <div className="ticket-details-sla-icon">

                            {isSlaOverdue ? (
                                <AlertTriangle
                                    size={18}
                                />
                            ) : (
                                <Clock3
                                    size={18}
                                />
                            )}

                        </div>

                        <div>

                            <span>
                                SLA STATUS
                            </span>

                            <strong>
                                {isSlaOverdue
                                    ? "Overdue"
                                    : ticket.slaDueAt
                                        ? "Within SLA"
                                        : "No SLA Due Date"}
                            </strong>

                            {ticket.slaDueAt && (
                                <p>
                                    {new Date(
                                        ticket.slaDueAt
                                    ).toLocaleString()}
                                </p>
                            )}

                        </div>

                    </section>

                </aside>

            </section>

            {/* =====================================================
          ATTACHMENTS
          ===================================================== */}

            <section className="ticket-details-panel ticket-details-attachments-panel">

                <div className="ticket-details-panel-header">

                    <div>

                        <span className="ticket-details-section-label">
                            FILES
                        </span>

                        <h2>
                            Attachments
                        </h2>

                        <p>
                            Files associated with
                            this support request.
                        </p>

                    </div>

                    <div className="ticket-details-count-chip">
                        <Paperclip
                            size={14}
                        />

                        {attachmentCount} files
                    </div>

                </div>

                <div className="ticket-details-upload">

                    <label className="ticket-details-file-picker">

                        <Upload
                            size={16}
                        />

                        <div>

                            <strong>
                                {selectedFile
                                    ? selectedFile.name
                                    : "Choose a file"}
                            </strong>

                            <span>
                                Select an attachment
                                from your device
                            </span>

                        </div>

                        <input
                            type="file"
                            disabled={
                                uploadLoading
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedFile(
                                    event.target
                                        .files?.[0] ??
                                    null
                                )
                            }
                        />

                    </label>

                    <button
                        type="button"
                        className="ticket-details-upload-button"
                        disabled={
                            uploadLoading ||
                            !selectedFile
                        }
                        onClick={() =>
                            void handleUpload()
                        }
                    >
                        <Upload
                            size={15}
                        />

                        {uploadLoading
                            ? "Uploading..."
                            : "Upload File"}
                    </button>

                </div>

                {attachments.length ===
                    0 ? (
                    <div className="ticket-details-empty">

                        <File
                            size={23}
                        />

                        <strong>
                            No attachments
                        </strong>

                        <span>
                            No files have been
                            uploaded for this ticket.
                        </span>

                    </div>
                ) : (
                    <div className="ticket-details-attachments-list">

                        {attachments.map(
                            (
                                attachment
                            ) => (
                                <article
                                    key={
                                        attachment.id
                                    }
                                    className="ticket-details-attachment"
                                >

                                    <div className="ticket-details-file-icon">
                                        <FileText
                                            size={18}
                                        />
                                    </div>

                                    <div className="ticket-details-file-copy">

                                        <strong>
                                            {getAttachmentName(
                                                attachment
                                            )}
                                        </strong>

                                        <div>

                                            <span>
                                                {attachment.mimeType ??
                                                    "File"}
                                            </span>

                                            {attachment.size && (
                                                <>
                                                    <i />

                                                    <span>
                                                        {Math.round(
                                                            attachment.size /
                                                            1024
                                                        )}{" "}
                                                        KB
                                                    </span>
                                                </>
                                            )}

                                            {attachment.createdAt && (
                                                <>
                                                    <i />

                                                    <span>
                                                        {new Date(
                                                            attachment.createdAt
                                                        ).toLocaleString()}
                                                    </span>
                                                </>
                                            )}

                                        </div>

                                    </div>

                                    <div className="ticket-details-file-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleDownload(
                                                    attachment
                                                )
                                            }
                                        >
                                            <Download
                                                size={14}
                                            />

                                            Download
                                        </button>

                                        {canDeleteAttachments && (
                                            <button
                                                type="button"
                                                className="danger"
                                                disabled={
                                                    actionLoading
                                                }
                                                onClick={() =>
                                                    void handleDeleteAttachment(
                                                        attachment.id
                                                    )
                                                }
                                            >
                                                <Trash2
                                                    size={14}
                                                />

                                                Delete
                                            </button>
                                        )}

                                    </div>

                                </article>
                            )
                        )}

                    </div>
                )}

            </section>

            {/* =====================================================
          CONVERSATION + HISTORY
          ===================================================== */}

            <section className="ticket-details-bottom-grid">

                {/* ===================================================
            CONVERSATION
            =================================================== */}

                <article className="ticket-details-panel">

                    <div className="ticket-details-panel-header">

                        <div>

                            <span className="ticket-details-section-label">
                                CONVERSATION
                            </span>

                            <h2>
                                Comments
                            </h2>

                            <p>
                                Ticket discussion and
                                internal technical notes.
                            </p>

                        </div>

                        <div className="ticket-details-count-chip">
                            <MessageSquare
                                size={14}
                            />

                            {commentCount}
                        </div>

                    </div>

                    {comments.length ===
                        0 ? (
                        <div className="ticket-details-empty compact">

                            <MessageSquare
                                size={22}
                            />

                            <strong>
                                No comments yet
                            </strong>

                            <span>
                                Start the conversation
                                below.
                            </span>

                        </div>
                    ) : (
                        <div className="ticket-details-comments">

                            {comments.map(
                                (
                                    comment
                                ) => {
                                    const initials =
                                        comment.user.fullName
                                            .split(" ")
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map(
                                                (part) =>
                                                    part[0]
                                            )
                                            .join("")
                                            .toUpperCase();

                                    return (
                                        <article
                                            key={
                                                comment.id
                                            }
                                            className={`ticket-details-comment ${comment.isInternal
                                                    ? "internal"
                                                    : ""
                                                }`}
                                        >

                                            <div className="ticket-details-comment-avatar">
                                                {initials ||
                                                    "U"}
                                            </div>

                                            <div className="ticket-details-comment-body">

                                                <div className="ticket-details-comment-meta">

                                                    <div>

                                                        <strong>
                                                            {
                                                                comment.user
                                                                    .fullName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {formatRole(
                                                                comment.user
                                                                    .role
                                                            )}
                                                        </span>

                                                    </div>

                                                    <small>
                                                        {new Date(
                                                            comment.createdAt
                                                        ).toLocaleString()}
                                                    </small>

                                                </div>

                                                {comment.isInternal && (
                                                    <span className="ticket-details-internal-badge">
                                                        <LockKeyhole
                                                            size={12}
                                                        />

                                                        Internal Note
                                                    </span>
                                                )}

                                                <p>
                                                    {
                                                        comment.message
                                                    }
                                                </p>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>
                    )}

                    {/* ADD COMMENT */}

                    <form
                        className="ticket-details-comment-form"
                        onSubmit={
                            handleAddComment
                        }
                    >

                        <div className="ticket-details-comment-form-header">

                            <div>

                                <Send
                                    size={15}
                                />

                                <strong>
                                    Add Comment
                                </strong>

                            </div>

                            {canUseInternalNotes && (
                                <label className="ticket-details-internal-toggle">

                                    <input
                                        type="checkbox"
                                        checked={
                                            isInternal
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setIsInternal(
                                                event.target
                                                    .checked
                                            )
                                        }
                                    />

                                    <span />

                                    Internal Note
                                </label>
                            )}

                        </div>

                        <textarea
                            value={
                                commentMessage
                            }
                            disabled={
                                actionLoading
                            }
                            placeholder={
                                isInternal
                                    ? "Write an internal technical note..."
                                    : "Write a comment..."
                            }
                            required
                            onChange={(
                                event
                            ) =>
                                setCommentMessage(
                                    event.target.value
                                )
                            }
                        />

                        <div className="ticket-details-comment-actions">

                            <span>
                                {isInternal
                                    ? "Visible according to internal note access."
                                    : "Add a reply to this support request."}
                            </span>

                            <button
                                type="submit"
                                disabled={
                                    actionLoading ||
                                    !commentMessage.trim()
                                }
                            >
                                <Send
                                    size={14}
                                />

                                {actionLoading
                                    ? "Saving..."
                                    : isInternal
                                        ? "Add Internal Note"
                                        : "Add Comment"}
                            </button>

                        </div>

                    </form>

                </article>

                {/* ===================================================
            HISTORY
            =================================================== */}

                <article className="ticket-details-panel">

                    <div className="ticket-details-panel-header">

                        <div>

                            <span className="ticket-details-section-label">
                                AUDIT TRAIL
                            </span>

                            <h2>
                                Ticket History
                            </h2>

                            <p>
                                Recorded changes and
                                workflow events.
                            </p>

                        </div>

                        <div className="ticket-details-count-chip">
                            <History
                                size={14}
                            />

                            {historyCount}
                        </div>

                    </div>

                    {history.length ===
                        0 ? (
                        <div className="ticket-details-empty compact">

                            <History
                                size={22}
                            />

                            <strong>
                                No history yet
                            </strong>

                            <span>
                                Ticket events will
                                appear here.
                            </span>

                        </div>
                    ) : (
                        <div className="ticket-details-history">

                            {history.map(
                                (
                                    item
                                ) => (
                                    <article
                                        key={
                                            item.id
                                        }
                                        className="ticket-details-history-item"
                                    >

                                        <div className="ticket-details-history-line">

                                            <div className="ticket-details-history-dot" />

                                        </div>

                                        <div className="ticket-details-history-content">

                                            <div className="ticket-details-history-heading">

                                                <strong>
                                                    {item.action}
                                                </strong>

                                                <small>
                                                    {new Date(
                                                        item.createdAt
                                                    ).toLocaleString()}
                                                </small>

                                            </div>

                                            <p>
                                                By{" "}
                                                <strong>
                                                    {
                                                        item.user
                                                            .fullName
                                                    }
                                                </strong>{" "}
                                                ·{" "}
                                                {formatRole(
                                                    item.user.role
                                                )}
                                            </p>

                                            {(item.oldValue ||
                                                item.newValue) && (
                                                    <div className="ticket-details-history-change">

                                                        {item.oldValue && (
                                                            <span>
                                                                <small>
                                                                    FROM
                                                                </small>

                                                                {
                                                                    item.oldValue
                                                                }
                                                            </span>
                                                        )}

                                                        {item.oldValue &&
                                                            item.newValue && (
                                                                <ArrowRightMini />
                                                            )}

                                                        {item.newValue && (
                                                            <span>
                                                                <small>
                                                                    TO
                                                                </small>

                                                                {
                                                                    item.newValue
                                                                }
                                                            </span>
                                                        )}

                                                    </div>
                                                )}

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

                </article>

            </section>

        </div>
    );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function TicketStatusIcon({
    status,
}: {
    status: TicketStatus;
}) {
    if (
        status ===
        "RESOLVED" ||
        status ===
        "CLOSED"
    ) {
        return (
            <CheckCircle2
                size={25}
            />
        );
    }

    return (
        <Wrench
            size={25}
        />
    );
}

function InfoItem({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone?:
    | "success"
    | "warning";
}) {
    return (
        <div
            className={`ticket-details-info-item ${tone
                    ? `tone-${tone}`
                    : ""
                }`}
        >

            <div className="ticket-details-info-icon">
                {icon}
            </div>

            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>
    );
}

function ArrowRightMini() {
    return (
        <span className="ticket-details-history-arrow">
            →
        </span>
    );
}