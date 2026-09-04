import prisma from "../config/prisma.js";

import {
    createNotification,
} from "./notification.service.js";

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
    const ticket =
        await prisma.ticket.findUnique({
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
    const ticket =
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
        throw new Error(
            "INTERNAL_NOTE_NOT_ALLOWED"
        );
    }

    const comment =
        await prisma.ticketComment.create({
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
                attachments: true,
            },
        });

    if (!isInternal) {
        let recipientUserId:
            | number
            | null = null;

        if (
            userRole === "EMPLOYEE" &&
            ticket.assignedToId !== null &&
            ticket.assignedToId !== userId
        ) {
            recipientUserId =
                ticket.assignedToId;
        }

        if (
            (
                userRole === "TECHNICIAN" ||
                userRole === "ADMIN"
            ) &&
            ticket.createdById !== userId
        ) {
            recipientUserId =
                ticket.createdById;
        }

        if (
            recipientUserId !== null
        ) {
            await createNotification({
                userId:
                    recipientUserId,
                type:
                    "TICKET_REPLY",
                title:
                    "New reply on your ticket",
                message:
                    `A new reply was added to ticket ${ticket.ticketNumber}.`,
                entityType:
                    "TICKET",
                entityId:
                    ticket.id,
            });
        }
    }

    return comment;
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
            attachments: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
};