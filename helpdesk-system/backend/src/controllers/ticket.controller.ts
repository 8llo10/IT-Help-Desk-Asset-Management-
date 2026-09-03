import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createTicket,
    getAllTickets,
    getTicketsByEmployee,
    getTicketsByTechnician,
    assignTicket,
    changeTicketStatus,
    getTicketHistory,
} from "../services/ticket.service.js";

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

        const {
            title,
            description,
            priority,
            categoryId,
            assetId,
        } = req.body;

        if (
            !title ||
            !description ||
            !priority ||
            !categoryId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title, description, priority and category are required",
            });
        }

        const ticket = await createTicket({
            title: title.trim(),
            description: description.trim(),
            priority,
            categoryId: Number(categoryId),
            createdById: req.user.userId,

            ...(assetId !== undefined && {
                assetId: Number(assetId),
            }),
        });

        return res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            data: {
                ticket,
            },
        });
    } catch (error) {
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

        let tickets;

        if (req.user.role === "ADMIN") {
            tickets = await getAllTickets();
        } else if (req.user.role === "TECHNICIAN") {
            tickets = await getTicketsByTechnician(
                req.user.userId
            );
        } else {
            tickets = await getTicketsByEmployee(
                req.user.userId
            );
        }

        return res.status(200).json({
            success: true,
            data: {
                tickets,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const assign = async (
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
        const { technicianId } = req.body;

        if (Number.isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket id",
            });
        }

        if (!technicianId) {
            return res.status(400).json({
                success: false,
                message: "Technician id is required",
            });
        }

        const ticket = await assignTicket(
            ticketId,
            Number(technicianId),
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Ticket assigned successfully",
            data: {
                ticket,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "TICKET_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        if (
            error instanceof Error &&
            error.message === "TECHNICIAN_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Technician not found",
            });
        }

        if (
            error instanceof Error &&
            error.message === "USER_NOT_TECHNICIAN"
        ) {
            return res.status(400).json({
                success: false,
                message: "Selected user is not a technician",
            });
        }

        if (
            error instanceof Error &&
            error.message === "TECHNICIAN_INACTIVE"
        ) {
            return res.status(400).json({
                success: false,
                message: "Technician account is inactive",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateStatus = async (
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
        const { status } = req.body;

        if (Number.isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket id",
            });
        }

        const validStatuses = [
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED",
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket status",
            });
        }

        const ticket = await changeTicketStatus(
            ticketId,
            status,
            req.user.userId,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: "Ticket status updated successfully",
            data: {
                ticket,
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

        if (
            error.message ===
            "INVALID_STATUS_TRANSITION"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket status transition",
            });
        }

        if (
            error.message ===
            "TICKET_NOT_ASSIGNED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Ticket must be assigned before work can begin",
            });
        }

        if (
            error.message ===
            "NOT_ASSIGNED_TECHNICIAN"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not assigned to this ticket",
            });
        }

        if (
            error.message ===
            "NOT_TICKET_OWNER"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the ticket owner can close this ticket",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const history = async (
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

        const history = await getTicketHistory(
            ticketId
        );

        return res.status(200).json({
            success: true,
            data: {
                history,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};