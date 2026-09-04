import type {
    Response,
    NextFunction,
} from "express";

import type {
    AuthRequest,
} from "./auth.middleware.js";

import {
    userHasPermission,
    userHasAnyPermission,
    userHasAllPermissions,
} from "../services/rbac.service.js";

/* =========================================================
   REQUIRE SINGLE PERMISSION
   ========================================================= */

export const requirePermission = (
    permissionCode: string
) => {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const allowed =
                await userHasPermission(
                    req.user.userId,
                    permissionCode
                );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have permission to perform this action",
                });
            }

            next();
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "USER_NOT_FOUND"
            ) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (
                error instanceof Error &&
                error.message === "USER_INACTIVE"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "User account is inactive",
                });
            }

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
};

/* =========================================================
   REQUIRE ANY PERMISSION
   ========================================================= */

export const requireAnyPermission = (
    permissionCodes: string[]
) => {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const allowed =
                await userHasAnyPermission(
                    req.user.userId,
                    permissionCodes
                );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have any of the required permissions",
                });
            }

            next();
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "USER_NOT_FOUND"
            ) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (
                error instanceof Error &&
                error.message === "USER_INACTIVE"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "User account is inactive",
                });
            }

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
};

/* =========================================================
   REQUIRE ALL PERMISSIONS
   ========================================================= */

export const requireAllPermissions = (
    permissionCodes: string[]
) => {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const allowed =
                await userHasAllPermissions(
                    req.user.userId,
                    permissionCodes
                );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have all required permissions",
                });
            }

            next();
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "USER_NOT_FOUND"
            ) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (
                error instanceof Error &&
                error.message === "USER_INACTIVE"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "User account is inactive",
                });
            }

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
};