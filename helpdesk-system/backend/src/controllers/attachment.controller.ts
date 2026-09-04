import fs from "fs";

import type {
    Response,
} from "express";

import type {
    AuthRequest,
} from "../middleware/auth.middleware.js";

import {
    createAttachment,
    getAttachmentById,
    getTicketAttachments,
    getCommentAttachments,
    deleteAttachment,
} from "../services/attachment.service.js";

/* =========================================================
   HELPERS
   ========================================================= */

const parseId = (
    value: unknown
): number | null => {
    const parsed = Number(value);

    if (
        Number.isNaN(parsed) ||
        parsed <= 0
    ) {
        return null;
    }

    return parsed;
};

const removeUploadedFile = (
    filePath?: string
) => {
    if (!filePath) {
        return;
    }

    try {
        if (
            fs.existsSync(filePath)
        ) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(
            "Failed to remove uploaded file:",
            error
        );
    }
};

/* =========================================================
   ERROR HANDLER
   ========================================================= */

const handleAttachmentError = (
    error: unknown,
    res: Response
) => {
    if (!(error instanceof Error)) {
        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }

    const errorMap: Record<
        string,
        {
            status: number;
            message: string;
        }
    > = {
        TICKET_NOT_FOUND: {
            status: 404,
            message:
                "Ticket not found",
        },

        USER_NOT_FOUND: {
            status: 404,
            message:
                "User not found",
        },

        USER_INACTIVE: {
            status: 403,
            message:
                "User account is inactive",
        },

        COMMENT_NOT_FOUND: {
            status: 404,
            message:
                "Comment not found",
        },

        COMMENT_TICKET_MISMATCH: {
            status: 400,
            message:
                "Comment does not belong to this ticket",
        },

        ATTACHMENT_NOT_FOUND: {
            status: 404,
            message:
                "Attachment not found",
        },

        INVALID_FILE_NAME: {
            status: 400,
            message:
                "Invalid file name",
        },

        INVALID_ORIGINAL_FILE_NAME: {
            status: 400,
            message:
                "Invalid original file name",
        },

        INVALID_MIME_TYPE: {
            status: 400,
            message:
                "Invalid file type",
        },

        INVALID_FILE_SIZE: {
            status: 400,
            message:
                "Invalid file size",
        },

        INVALID_FILE_URL: {
            status: 400,
            message:
                "Invalid file URL",
        },

        INVALID_FILE_TYPE: {
            status: 400,
            message:
                "File type is not allowed",
        },
    };

    const mapped =
        errorMap[error.message];

    if (mapped) {
        return res
            .status(mapped.status)
            .json({
                success: false,
                message:
                    mapped.message,
            });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message:
            "Internal server error",
    });
};

/* =========================================================
   UPLOAD TICKET ATTACHMENTS
   ========================================================= */

export const uploadTicketAttachments =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required",
                });
            }

            const ticketId =
                parseId(req.params.id);

            if (ticketId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid ticket id",
                });
            }

            const files =
                req.files as
                | Express.Multer.File[]
                | undefined;

            if (
                !files ||
                files.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "At least one file is required",
                });
            }

            const attachments = [];

            try {
                for (
                    const file of files
                ) {
                    const attachment =
                        await createAttachment({
                            ticketId,

                            uploadedById:
                                req.user.userId,

                            fileName:
                                file.filename,

                            originalName:
                                file.originalname,

                            mimeType:
                                file.mimetype,

                            fileSize:
                                file.size,

                            fileUrl:
                                `/uploads/tickets/${file.filename}`,
                        });

                    attachments.push(
                        attachment
                    );
                }
            } catch (error) {
                /*
                  إذا فشل تسجيل الملفات في DB
                  نحذف الملفات التي رفعها Multer
                  حتى لا تبقى orphan files.
                */
                for (
                    const file of files
                ) {
                    removeUploadedFile(
                        file.path
                    );
                }

                throw error;
            }

            return res.status(201).json({
                success: true,
                message:
                    "Attachments uploaded successfully",

                data: {
                    attachments,
                },
            });
        } catch (error) {
            return handleAttachmentError(
                error,
                res
            );
        }
    };

/* =========================================================
   UPLOAD COMMENT ATTACHMENTS
   ========================================================= */

export const uploadCommentAttachments =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required",
                });
            }

            const ticketId =
                parseId(req.params.id);

            const commentId =
                parseId(
                    req.params.commentId
                );

            if (ticketId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid ticket id",
                });
            }

            if (commentId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid comment id",
                });
            }

            const files =
                req.files as
                | Express.Multer.File[]
                | undefined;

            if (
                !files ||
                files.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "At least one file is required",
                });
            }

            const attachments = [];

            try {
                for (
                    const file of files
                ) {
                    const attachment =
                        await createAttachment({
                            ticketId,
                            commentId,

                            uploadedById:
                                req.user.userId,

                            fileName:
                                file.filename,

                            originalName:
                                file.originalname,

                            mimeType:
                                file.mimetype,

                            fileSize:
                                file.size,

                            fileUrl:
                                `/uploads/tickets/${file.filename}`,
                        });

                    attachments.push(
                        attachment
                    );
                }
            } catch (error) {
                for (
                    const file of files
                ) {
                    removeUploadedFile(
                        file.path
                    );
                }

                throw error;
            }

            return res.status(201).json({
                success: true,
                message:
                    "Comment attachments uploaded successfully",

                data: {
                    attachments,
                },
            });
        } catch (error) {
            return handleAttachmentError(
                error,
                res
            );
        }
    };

/* =========================================================
   GET TICKET ATTACHMENTS
   ========================================================= */

export const getTicketFiles =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            const ticketId =
                parseId(req.params.id);

            if (ticketId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid ticket id",
                });
            }

            const attachments =
                await getTicketAttachments(
                    ticketId
                );

            return res.status(200).json({
                success: true,

                data: {
                    attachments,
                },
            });
        } catch (error) {
            return handleAttachmentError(
                error,
                res
            );
        }
    };

/* =========================================================
   GET COMMENT ATTACHMENTS
   ========================================================= */

export const getCommentFiles =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            const commentId =
                parseId(
                    req.params.commentId
                );

            if (commentId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid comment id",
                });
            }

            const attachments =
                await getCommentAttachments(
                    commentId
                );

            return res.status(200).json({
                success: true,

                data: {
                    attachments,
                },
            });
        } catch (error) {
            return handleAttachmentError(
                error,
                res
            );
        }
    };

/* =========================================================
   GET ATTACHMENT
   ========================================================= */

export const getOneAttachment =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            const attachmentId =
                parseId(
                    req.params.attachmentId
                );

            if (
                attachmentId === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid attachment id",
                });
            }

            const attachment =
                await getAttachmentById(
                    attachmentId
                );

            return res.status(200).json({
                success: true,

                data: {
                    attachment,
                },
            });
        } catch (error) {
            return handleAttachmentError(
                error,
                res
            );
        }
    };

/* =========================================================
   DELETE ATTACHMENT
   ========================================================= */

export const removeAttachment =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            const attachmentId =
                parseId(
                    req.params.attachmentId
                );

            if (
                attachmentId === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid attachment id",
                });
            }

            const attachment =
                await getAttachmentById(
                    attachmentId
                );

            await deleteAttachment(
                attachmentId
            );

            /*
              بعد حذف الـrecord
              نحذف الملف نفسه من disk.
            */
            const filePath =
                attachment.fileUrl.startsWith(
                    "/uploads/"
                )
                    ? `${process.cwd()}${attachment.fileUrl}`
                    : undefined;

            removeUploadedFile(
                filePath
            );

            return res.status(200).json({
                success: true,
                message:
                    "Attachment deleted successfully",
            });
        } catch (error) {
            return handleAttachmentError(
                error,
                res
            );
        }
    };