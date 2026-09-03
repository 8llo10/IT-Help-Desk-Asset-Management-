// src/controllers/dashboard.controller.ts

import type { Request, Response } from "express";

import {
    getDashboardStats,
    getRecentTickets,
} from "../services/dashboard.service.js";

export const stats = async (
    req: Request,
    res: Response
) => {
    try {
        const dashboard = await getDashboardStats();

        return res.status(200).json({
            success: true,
            data: dashboard,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const recentTickets = async (
    req: Request,
    res: Response
) => {
    try {
        const tickets = await getRecentTickets();

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