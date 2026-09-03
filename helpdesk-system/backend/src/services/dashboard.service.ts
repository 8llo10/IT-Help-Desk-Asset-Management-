// src/services/dashboard.service.ts

import prisma from "../config/prisma.js";

export const getDashboardStats = async () => {
    const now = new Date();

    const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        criticalTickets,
        highTickets,
        totalAssets,
        availableAssets,
        maintenanceAssets,
        totalUsers,
        slaBreachedTickets,
    ] = await Promise.all([
        prisma.ticket.count(),

        prisma.ticket.count({
            where: {
                status: "OPEN",
            },
        }),

        prisma.ticket.count({
            where: {
                status: "IN_PROGRESS",
            },
        }),

        prisma.ticket.count({
            where: {
                status: "RESOLVED",
            },
        }),

        prisma.ticket.count({
            where: {
                status: "CLOSED",
            },
        }),

        prisma.ticket.count({
            where: {
                priority: "CRITICAL",
            },
        }),

        prisma.ticket.count({
            where: {
                priority: "HIGH",
            },
        }),

        prisma.asset.count(),

        prisma.asset.count({
            where: {
                status: "AVAILABLE",
            },
        }),

        prisma.asset.count({
            where: {
                status: "MAINTENANCE",
            },
        }),

        prisma.user.count({
            where: {
                isActive: true,
            },
        }),

        prisma.ticket.count({
            where: {
                slaDueAt: {
                    lt: now,
                },

                status: {
                    not: "CLOSED",
                },
            },
        }),
    ]);

    return {
        tickets: {
            total: totalTickets,
            open: openTickets,
            inProgress: inProgressTickets,
            resolved: resolvedTickets,
            closed: closedTickets,
            critical: criticalTickets,
            high: highTickets,
            slaBreached: slaBreachedTickets,
        },

        assets: {
            total: totalAssets,
            available: availableAssets,
            maintenance: maintenanceAssets,
        },

        users: {
            totalActive: totalUsers,
        },
    };
};

export const getRecentTickets = async () => {
    return prisma.ticket.findMany({
        take: 5,

        orderBy: {
            createdAt: "desc",
        },

        include: {
            category: true,

            createdBy: {
                select: {
                    id: true,
                    fullName: true,
                },
            },

            assignedTo: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
        },
    });
};