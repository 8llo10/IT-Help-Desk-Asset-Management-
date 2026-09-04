import prisma from "../config/prisma.js";

/* =========================================================
   TYPES
   ========================================================= */

interface CreateAttachmentInput {
    ticketId: number;
    uploadedById: number;

    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    fileUrl: string;

    commentId?: number;
}

/* =========================================================
   CHECK TICKET
   ========================================================= */

const getTicketOrThrow = async (
    ticketId: number
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

    return ticket;
};

/* =========================================================
   CREATE ATTACHMENT
   ========================================================= */

export const createAttachment = async (
    data: CreateAttachmentInput
) => {
    await getTicketOrThrow(
        data.ticketId
    );

    /* =======================================================
       USER
       ======================================================= */

    const user =
        await prisma.user.findUnique({
            where: {
                id: data.uploadedById,
            },
        });

    if (!user) {
        throw new Error(
            "USER_NOT_FOUND"
        );
    }

    if (!user.isActive) {
        throw new Error(
            "USER_INACTIVE"
        );
    }

    /* =======================================================
       COMMENT
       ======================================================= */

    if (
        data.commentId !== undefined
    ) {
        const comment =
            await prisma.ticketComment.findUnique({
                where: {
                    id: data.commentId,
                },
            });

        if (!comment) {
            throw new Error(
                "COMMENT_NOT_FOUND"
            );
        }

        /*
          مهم:
          ما نسمح نربط Attachment
          بتعليق تابع لتذكرة ثانية.
        */
        if (
            comment.ticketId !==
            data.ticketId
        ) {
            throw new Error(
                "COMMENT_TICKET_MISMATCH"
            );
        }
    }

    /* =======================================================
       VALIDATION
       ======================================================= */

    if (!data.fileName.trim()) {
        throw new Error(
            "INVALID_FILE_NAME"
        );
    }

    if (!data.originalName.trim()) {
        throw new Error(
            "INVALID_ORIGINAL_FILE_NAME"
        );
    }

    if (!data.mimeType.trim()) {
        throw new Error(
            "INVALID_MIME_TYPE"
        );
    }

    if (
        !Number.isInteger(
            data.fileSize
        ) ||
        data.fileSize <= 0
    ) {
        throw new Error(
            "INVALID_FILE_SIZE"
        );
    }

    if (!data.fileUrl.trim()) {
        throw new Error(
            "INVALID_FILE_URL"
        );
    }

    /* =======================================================
       CREATE DATA
       ======================================================= */

    const createData: {
        ticketId: number;
        uploadedById: number;

        fileName: string;
        originalName: string;
        mimeType: string;
        fileSize: number;
        fileUrl: string;

        commentId?: number;
    } = {
        ticketId:
            data.ticketId,

        uploadedById:
            data.uploadedById,

        fileName:
            data.fileName.trim(),

        originalName:
            data.originalName.trim(),

        mimeType:
            data.mimeType.trim(),

        fileSize:
            data.fileSize,

        fileUrl:
            data.fileUrl.trim(),
    };

    if (
        data.commentId !== undefined
    ) {
        createData.commentId =
            data.commentId;
    }

    return prisma.ticketAttachment.create({
        data: createData,

        include: {
            uploadedBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },

            comment: {
                select: {
                    id: true,
                    message: true,
                    isInternal: true,
                    createdAt: true,
                },
            },
        },
    });
};

/* =========================================================
   GET ATTACHMENT BY ID
   ========================================================= */

export const getAttachmentById =
    async (
        id: number
    ) => {
        const attachment =
            await prisma.ticketAttachment.findUnique({
                where: {
                    id,
                },

                include: {
                    ticket: {
                        select: {
                            id: true,
                            ticketNumber: true,
                            title: true,
                            status: true,
                            createdById: true,
                            assignedToId: true,
                        },
                    },

                    comment: {
                        select: {
                            id: true,
                            message: true,
                            isInternal: true,
                            userId: true,
                            createdAt: true,
                        },
                    },

                    uploadedBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });

        if (!attachment) {
            throw new Error(
                "ATTACHMENT_NOT_FOUND"
            );
        }

        return attachment;
    };

/* =========================================================
   GET TICKET ATTACHMENTS
   ========================================================= */

export const getTicketAttachments =
    async (
        ticketId: number
    ) => {
        await getTicketOrThrow(
            ticketId
        );

        return prisma.ticketAttachment.findMany({
            where: {
                ticketId,
            },

            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true,
                    },
                },

                comment: {
                    select: {
                        id: true,
                        isInternal: true,
                    },
                },
            },

            orderBy: {
                createdAt: "asc",
            },
        });
    };

/* =========================================================
   GET COMMENT ATTACHMENTS
   ========================================================= */

export const getCommentAttachments =
    async (
        commentId: number
    ) => {
        const comment =
            await prisma.ticketComment.findUnique({
                where: {
                    id: commentId,
                },
            });

        if (!comment) {
            throw new Error(
                "COMMENT_NOT_FOUND"
            );
        }

        return prisma.ticketAttachment.findMany({
            where: {
                commentId,
            },

            include: {
                uploadedBy: {
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

/* =========================================================
   DELETE ATTACHMENT RECORD
   ========================================================= */

export const deleteAttachment = async (
    id: number
) => {
    const attachment =
        await prisma.ticketAttachment.findUnique({
            where: {
                id,
            },
        });

    if (!attachment) {
        throw new Error(
            "ATTACHMENT_NOT_FOUND"
        );
    }

    /*
      هذا يحذف Record من PostgreSQL فقط.
  
      حذف الملف الفعلي من Storage
      راح يتم في طبقة الـupload/storage،
      مو من Prisma.
    */

    return prisma.ticketAttachment.delete({
        where: {
            id,
        },
    });
};