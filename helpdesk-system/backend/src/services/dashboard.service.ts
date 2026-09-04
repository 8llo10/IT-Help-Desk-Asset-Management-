// src/services/dashboard.service.ts

import prisma from "../config/prisma.js";

/* =========================================================
   DASHBOARD STATS
   ========================================================= */

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

        slaBreachedTickets,

        totalAssets,
        availableAssets,
        inUseAssets,
        maintenanceAssets,
        retiredAssets,

        totalActiveUsers,
        totalInactiveUsers,
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

        prisma.ticket.count({
            where: {
                slaDueAt: {
                    lt: now,
                },

                status: {
                    notIn: [
                        "RESOLVED",
                        "CLOSED",
                    ],
                },
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
                status: "IN_USE",
            },
        }),

        prisma.asset.count({
            where: {
                status: "MAINTENANCE",
            },
        }),

        prisma.asset.count({
            where: {
                status: "RETIRED",
            },
        }),

        prisma.user.count({
            where: {
                isActive: true,
            },
        }),

        prisma.user.count({
            where: {
                isActive: false,
            },
        }),
    ]);

    return {
        tickets: {
            total: totalTickets,

            byStatus: {
                open: openTickets,
                inProgress: inProgressTickets,
                resolved: resolvedTickets,
                closed: closedTickets,
            },

            byPriority: {
                critical: criticalTickets,
                high: highTickets,
            },

            slaBreached: slaBreachedTickets,
        },

        assets: {
            total: totalAssets,

            byStatus: {
                available: availableAssets,
                inUse: inUseAssets,
                maintenance: maintenanceAssets,
                retired: retiredAssets,
            },
        },

        users: {
            active: totalActiveUsers,
            inactive: totalInactiveUsers,
            total:
                totalActiveUsers +
                totalInactiveUsers,
        },
    };
};

/* =========================================================
   RECENT TICKETS
   ========================================================= */

export const getRecentTickets = async () => {
    return prisma.ticket.findMany({
        take: 5,

        orderBy: {
            createdAt: "desc",
        },

        include: {
            category: true,

            asset: {
                select: {
                    id: true,
                    assetTag: true,
                    type: true,
                    status: true,
                },
            },

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
};