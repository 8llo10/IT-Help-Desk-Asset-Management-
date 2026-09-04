import { Router } from "express";

import {
    register,
    login,
} from "../controllers/auth.controller.js";

import {
    authenticate,
    type AuthRequest,
} from "../middleware/auth.middleware.js";

import {
    authorize,
} from "../middleware/role.middleware.js";

import prisma from "../config/prisma.js";

const router = Router();

/* =========================================================
   PUBLIC AUTH ROUTES
   ========================================================= */

router.post(
    "/register",
    register
);

router.post(
    "/login",
    login
);

/* =========================================================
   CURRENT USER
   ========================================================= */

router.get(
    "/me",
    authenticate,
    async (
        req: AuthRequest,
        res
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required",
                });
            }

            const user =
                await prisma.user.findUnique({
                    where: {
                        id: req.user.userId,
                    },

                    select: {
                        id: true,
                        fullName: true,
                        email: true,

                        employeeNumber: true,
                        jobTitle: true,

                        role: true,
                        isActive: true,

                        organization: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                status: true,
                            },
                        },

                        branch: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                status: true,
                            },
                        },

                        location: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                status: true,
                            },
                        },

                        department: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },

                        team: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },

                        manager: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },

                        createdAt: true,
                        updatedAt: true,
                    },
                });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    user,
                },
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Internal server error",
            });
        }
    }
);

/* =========================================================
   ADMIN TEST
   ========================================================= */

router.get(
    "/admin-test",
    authenticate,
    authorize("ADMIN"),
    (
        req,
        res
    ) => {
        return res.status(200).json({
            success: true,
            message: "Welcome Admin",
        });
    }
);

export default router;