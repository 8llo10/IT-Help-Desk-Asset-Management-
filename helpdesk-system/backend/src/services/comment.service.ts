import prisma from "../config/prisma.js";

interface AddCommentInput {
    ticketId: number;
    userId: number;
    userRole: string;
    message: string;
    isInternal: boolean;
}

const checkTicketAccess = async (
    ticketId: number,
    userId: number,
    userRole: string
) => {
    const ticket = await prisma.ticket.findUnique({
        where: {
            id: ticketId,
        },
    });

    if (!ticket) {
        throw new Error("TICKET_NOT_FOUND");
    }

    if (userRole === "ADMIN") {
        return ticket;
    }

    if (
        userRole === "TECHNICIAN" &&
        ticket.assignedToId === userId
    ) {
        return ticket;
    }

    if (
        userRole === "EMPLOYEE" &&
        ticket.createdById === userId
    ) {
        return ticket;
    }

    throw new Error("ACCESS_DENIED");
};

export const addComment = async ({
    ticketId,
    userId,
    userRole,
    message,
    isInternal,
}: AddCommentInput) => {
    await checkTicketAccess(
        ticketId,
        userId,
        userRole
    );

    if (
        isInternal &&
        userRole !== "ADMIN" &&
        userRole !== "TECHNICIAN"
    ) {
        throw new Error("INTERNAL_NOTE_NOT_ALLOWED");
    }

    return prisma.ticketComment.create({
        data: {
            ticketId,
            userId,
            message,
            isInternal,
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
    });
};

export const getComments = async (
    ticketId: number,
    userId: number,
    userRole: string
) => {
    await checkTicketAccess(
        ticketId,
        userId,
        userRole
    );

    return prisma.ticketComment.findMany({
        where: {
            ticketId,

            ...(userRole === "EMPLOYEE" && {
                isInternal: false,
            }),
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
            createdAt: "asc",
        },
    });
};