import prisma from "../config/prisma.js";

import {
    createNotification,
} from "./notification.service.js";

interface CreateTicketInput {
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    categoryId: number;
    createdById: number;
    assetId?: number | null;
}

type TicketStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

/* =========================================================
   CREATE TICKET
   ========================================================= */

export const createTicket = async (
    data: CreateTicketInput
) => {
    const ticketCount =
        await prisma.ticket.count();

    const ticketNumber =
        `TK-${String(
            ticketCount + 1
        ).padStart(5, "0")}`;

    const now =
        new Date();

    const slaHours = {
        LOW: 24,
        MEDIUM: 8,
        HIGH: 4,
        CRITICAL: 2,
    };

    const slaDueAt =
        new Date(
            now.getTime() +
            slaHours[data.priority] *
            60 *
            60 *
            1000
        );

    const ticket =
        await prisma.ticket.create({
            data: {
                ...data,
                ticketNumber,
                slaDueAt,
            },

            include: {
                category: true,
                asset: true,

                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

    await prisma.ticketHistory.create({
        data: {
            ticketId: ticket.id,
            changedBy:
                data.createdById,
            action:
                "CREATED",
            newValue:
                "OPEN",
        },
    });

    return ticket;
};

/* =========================================================
   GET ALL TICKETS
   ========================================================= */

export const getAllTickets =
    async () => {
        return prisma.ticket.findMany({
            include: {
                category: true,
                asset: true,

                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },

                assignedTo: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },

            orderBy: {
                createdAt:
                    "desc",
            },
        });
    };

/* =========================================================
   GET EMPLOYEE TICKETS
   ========================================================= */

export const getTicketsByEmployee =
    async (
        userId: number
    ) => {
        return prisma.ticket.findMany({
            where: {
                createdById:
                    userId,
            },

            include: {
                category: true,
                asset: true,

                assignedTo: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },

            orderBy: {
                createdAt:
                    "desc",
            },
        });
    };

/* =========================================================
   GET TECHNICIAN TICKETS
   ========================================================= */

export const getTicketsByTechnician =
    async (
        userId: number
    ) => {
        return prisma.ticket.findMany({
            where: {
                assignedToId:
                    userId,
            },

            include: {
                category: true,
                asset: true,

                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },

            orderBy: {
                createdAt:
                    "desc",
            },
        });
    };

/* =========================================================
   ASSIGN TICKET
   ========================================================= */

export const assignTicket = async (
    ticketId: number,
    technicianId: number,
    changedBy: number
) => {
    const ticket =
        await prisma.ticket.findUnique({
            where: {
                id: ticketId,
            },
        });

    if (!ticket) {
        throw new Error(
            "TICKET_NOT_FOUND"
        );
    }

    const technician =
        await prisma.user.findUnique({
            where: {
                id:
                    technicianId,
            },
        });

    if (!technician) {
        throw new Error(
            "TECHNICIAN_NOT_FOUND"
        );
    }

    if (
        technician.role !==
        "TECHNICIAN"
    ) {
        throw new Error(
            "USER_NOT_TECHNICIAN"
        );
    }

    if (
        !technician.isActive
    ) {
        throw new Error(
            "TECHNICIAN_INACTIVE"
        );
    }

    const updatedTicket =
        await prisma.ticket.update({
            where: {
                id:
                    ticketId,
            },

            data: {
                assignedToId:
                    technicianId,
            },

            include: {
                assignedTo: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },

                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },

                category: true,
                asset: true,
            },
        });

    await prisma.ticketHistory.create({
        data: {
            ticketId,
            changedBy,
            action:
                "ASSIGNED",

            oldValue:
                ticket.assignedToId
                    ? String(
                        ticket.assignedToId
                    )
                    : null,

            newValue:
                String(
                    technicianId
                ),
        },
    });

    /* =====================================================
       NOTIFY TECHNICIAN
       ===================================================== */

    await createNotification({
        userId:
            technicianId,

        type:
            "TICKET_ASSIGNED",

        title:
            "New ticket assigned",

        message:
            `Ticket ${updatedTicket.ticketNumber} has been assigned to you.`,

        entityType:
            "TICKET",

        entityId:
            updatedTicket.id,
    });

    return updatedTicket;
};

/* =========================================================
   ALLOWED STATUS TRANSITIONS
   ========================================================= */

const allowedTransitions: Record<
    TicketStatus,
    TicketStatus[]
> = {
    OPEN: [
        "IN_PROGRESS",
    ],

    IN_PROGRESS: [
        "RESOLVED",
    ],

    RESOLVED: [
        "CLOSED",
    ],

    CLOSED: [],
};

/* =========================================================
   CHANGE TICKET STATUS
   ========================================================= */

export const changeTicketStatus =
    async (
        ticketId: number,
        newStatus: TicketStatus,
        userId: number,
        userRole: string
    ) => {
        const ticket =
            await prisma.ticket.findUnique({
                where: {
                    id:
                        ticketId,
                },
            });

        if (!ticket) {
            throw new Error(
                "TICKET_NOT_FOUND"
            );
        }

        const currentStatus =
            ticket.status as TicketStatus;

        if (
            !allowedTransitions[
                currentStatus
            ].includes(
                newStatus
            )
        ) {
            throw new Error(
                "INVALID_STATUS_TRANSITION"
            );
        }

        if (
            newStatus ===
            "IN_PROGRESS" ||
            newStatus ===
            "RESOLVED"
        ) {
            if (
                !ticket.assignedToId
            ) {
                throw new Error(
                    "TICKET_NOT_ASSIGNED"
                );
            }

            if (
                userRole !==
                "ADMIN" &&
                ticket.assignedToId !==
                userId
            ) {
                throw new Error(
                    "NOT_ASSIGNED_TECHNICIAN"
                );
            }
        }

        if (
            newStatus ===
            "CLOSED"
        ) {
            if (
                userRole !==
                "ADMIN" &&
                ticket.createdById !==
                userId
            ) {
                throw new Error(
                    "NOT_TICKET_OWNER"
                );
            }
        }

        const updatedTicket =
            await prisma.ticket.update({
                where: {
                    id:
                        ticketId,
                },

                data: {
                    status:
                        newStatus,

                    ...(
                        newStatus ===
                        "RESOLVED" && {
                            resolvedAt:
                                new Date(),
                        }
                    ),

                    ...(
                        newStatus ===
                        "CLOSED" && {
                            closedAt:
                                new Date(),
                        }
                    ),
                },

                include: {
                    category: true,
                    asset: true,

                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },

                    assignedTo: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });

        await prisma.ticketHistory.create({
            data: {
                ticketId,
                changedBy:
                    userId,
                action:
                    "STATUS_CHANGED",
                oldValue:
                    currentStatus,
                newValue:
                    newStatus,
            },
        });

        /* =====================================================
           NOTIFICATION TYPE
           ===================================================== */

        let notificationType:
            | "TICKET_STATUS_CHANGED"
            | "TICKET_RESOLVED"
            | "TICKET_CLOSED"
            | "TICKET_REOPENED";

        if (
            newStatus ===
            "RESOLVED"
        ) {
            notificationType =
                "TICKET_RESOLVED";
        } else if (
            newStatus ===
            "CLOSED"
        ) {
            notificationType =
                "TICKET_CLOSED";
        } else if (
            newStatus ===
            "OPEN" &&
            currentStatus ===
            "CLOSED"
        ) {
            notificationType =
                "TICKET_REOPENED";
        } else {
            notificationType =
                "TICKET_STATUS_CHANGED";
        }

        /* =====================================================
           NOTIFY TICKET OWNER

           Don't notify the user who performed the change.
           ===================================================== */

        if (
            ticket.createdById !==
            userId
        ) {
            await createNotification({
                userId:
                    ticket.createdById,

                type:
                    notificationType,

                title:
                    "Ticket status updated",

                message:
                    `Ticket ${updatedTicket.ticketNumber} changed from ${currentStatus} to ${newStatus}.`,

                entityType:
                    "TICKET",

                entityId:
                    updatedTicket.id,
            });
        }

        return updatedTicket;
    };

/* =========================================================
   GET TICKET HISTORY
   ========================================================= */

export const getTicketHistory =
    async (
        ticketId: number
    ) => {
        return prisma.ticketHistory.findMany({
            where: {
                ticketId,
            },

            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true,
                    },
                },
            },

            orderBy: {
                createdAt:
                    "asc",
            },
        });
    };