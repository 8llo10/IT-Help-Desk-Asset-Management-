import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
    addComment,
    getComments,
} from "../services/comment.service.js";

export const create = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const ticketId = Number(req.params.id);

        if (Number.isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket id",
            });
        }

        const {
            message,
            isInternal = false,
        } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment message is required",
            });
        }

        const comment = await addComment({
            ticketId,
            userId: req.user.userId,
            userRole: req.user.role,
            message: message.trim(),
            isInternal: Boolean(isInternal),
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: {
                comment,
            },
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }

        if (error.message === "TICKET_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        if (error.message === "ACCESS_DENIED") {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket",
            });
        }

        if (
            error.message === "INTERNAL_NOTE_NOT_ALLOWED"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only technicians and admins can add internal notes",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAll = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const ticketId = Number(req.params.id);

        if (Number.isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket id",
            });
        }

        const comments = await getComments(
            ticketId,
            req.user.userId,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            data: {
                comments,
            },
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }

        if (error.message === "TICKET_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        if (error.message === "ACCESS_DENIED") {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this ticket",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};