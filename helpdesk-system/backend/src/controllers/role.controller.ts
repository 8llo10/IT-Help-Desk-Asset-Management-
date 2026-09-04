import type { Request, Response } from "express";

import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    assignPermissionToRole,
    removePermissionFromRole,
    assignRoleToUser,
    removeRoleFromUser,
    getUserPermissions,
} from "../services/role.service.js";

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

const handleRoleError = (
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
        INVALID_ROLE_NAME: {
            status: 400,
            message: "Invalid role name",
        },

        INVALID_ROLE_CODE: {
            status: 400,
            message: "Invalid role code",
        },

        ROLE_CODE_EXISTS: {
            status: 409,
            message:
                "Role code already exists",
        },

        ROLE_NOT_FOUND: {
            status: 404,
            message: "Role not found",
        },

        ORGANIZATION_NOT_FOUND: {
            status: 404,
            message:
                "Organization not found",
        },

        PERMISSION_NOT_FOUND: {
            status: 404,
            message:
                "Permission not found",
        },

        PERMISSION_ALREADY_ASSIGNED: {
            status: 409,
            message:
                "Permission is already assigned to this role",
        },

        ROLE_PERMISSION_NOT_FOUND: {
            status: 404,
            message:
                "Permission is not assigned to this role",
        },

        USER_NOT_FOUND: {
            status: 404,
            message: "User not found",
        },

        ROLE_ORGANIZATION_MISMATCH: {
            status: 400,
            message:
                "Role does not belong to the user's organization",
        },

        ROLE_ALREADY_ASSIGNED: {
            status: 409,
            message:
                "Role is already assigned to this user",
        },

        USER_ROLE_NOT_FOUND: {
            status: 404,
            message:
                "Role is not assigned to this user",
        },
    };

    const mapped =
        errorMap[error.message];

    if (mapped) {
        return res
            .status(mapped.status)
            .json({
                success: false,
                message: mapped.message,
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
   CREATE ROLE
   ========================================================= */

export const create = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            code,
            description,
            organizationId,
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Role name is required",
            });
        }

        if (
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Role code is required",
            });
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Description must be a string",
            });
        }

        const createData: {
            name: string;
            code: string;
            description?: string;
            organizationId?: number;
        } = {
            name,
            code,
        };

        if (
            typeof description === "string"
        ) {
            createData.description =
                description;
        }

        if (
            organizationId !== undefined &&
            organizationId !== null
        ) {
            const parsedOrganizationId =
                parseId(organizationId);

            if (
                parsedOrganizationId === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid organization id",
                });
            }

            createData.organizationId =
                parsedOrganizationId;
        }

        const role =
            await createRole(
                createData
            );

        return res.status(201).json({
            success: true,
            message:
                "Role created successfully",

            data: {
                role,
            },
        });
    } catch (error) {
        return handleRoleError(
            error,
            res
        );
    }
};

/* =========================================================
   GET ALL ROLES
   ========================================================= */

export const getAll = async (
    req: Request,
    res: Response
) => {
    try {
        if (
            req.query.organizationId !==
            undefined
        ) {
            const organizationId =
                parseId(
                    req.query.organizationId
                );

            if (
                organizationId === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid organization id",
                });
            }

            const roles =
                await getAllRoles(
                    organizationId
                );

            return res.status(200).json({
                success: true,

                data: {
                    roles,
                },
            });
        }

        const roles =
            await getAllRoles();

        return res.status(200).json({
            success: true,

            data: {
                roles,
            },
        });
    } catch (error) {
        return handleRoleError(
            error,
            res
        );
    }
};

/* =========================================================
   GET ROLE BY ID
   ========================================================= */

export const getOne = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            parseId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid role id",
            });
        }

        const role =
            await getRoleById(id);

        return res.status(200).json({
            success: true,

            data: {
                role,
            },
        });
    } catch (error) {
        return handleRoleError(
            error,
            res
        );
    }
};

/* =========================================================
   UPDATE ROLE
   ========================================================= */

export const patch = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            parseId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid role id",
            });
        }

        const {
            name,
            description,
        } = req.body;

        const updateData: {
            name?: string;
            description?: string;
        } = {};

        if (name !== undefined) {
            if (
                typeof name !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Role name must be a string",
                });
            }

            updateData.name = name;
        }

        if (
            description !== undefined
        ) {
            if (
                typeof description !==
                "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Description must be a string",
                });
            }

            updateData.description =
                description;
        }

        const role =
            await updateRole(
                id,
                updateData
            );

        return res.status(200).json({
            success: true,
            message:
                "Role updated successfully",

            data: {
                role,
            },
        });
    } catch (error) {
        return handleRoleError(
            error,
            res
        );
    }
};

/* =========================================================
   ASSIGN PERMISSION TO ROLE
   ========================================================= */

export const assignPermission =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const roleId =
                parseId(req.params.id);

            const permissionId =
                parseId(
                    req.body.permissionId
                );

            if (roleId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid role id",
                });
            }

            if (
                permissionId === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Valid permission id is required",
                });
            }

            const assignment =
                await assignPermissionToRole(
                    roleId,
                    permissionId
                );

            return res.status(201).json({
                success: true,
                message:
                    "Permission assigned to role successfully",

                data: {
                    assignment,
                },
            });
        } catch (error) {
            return handleRoleError(
                error,
                res
            );
        }
    };

/* =========================================================
   REMOVE PERMISSION FROM ROLE
   ========================================================= */

export const removePermission =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const roleId =
                parseId(req.params.id);

            const permissionId =
                parseId(
                    req.params.permissionId
                );

            if (
                roleId === null ||
                permissionId === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid role or permission id",
                });
            }

            await removePermissionFromRole(
                roleId,
                permissionId
            );

            return res.status(200).json({
                success: true,
                message:
                    "Permission removed from role successfully",
            });
        } catch (error) {
            return handleRoleError(
                error,
                res
            );
        }
    };

/* =========================================================
   ASSIGN ROLE TO USER
   ========================================================= */

export const assignToUser =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const roleId =
                parseId(req.params.id);

            const userId =
                parseId(
                    req.body.userId
                );

            if (roleId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid role id",
                });
            }

            if (userId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Valid user id is required",
                });
            }

            const assignment =
                await assignRoleToUser(
                    userId,
                    roleId
                );

            return res.status(201).json({
                success: true,
                message:
                    "Role assigned to user successfully",

                data: {
                    assignment,
                },
            });
        } catch (error) {
            return handleRoleError(
                error,
                res
            );
        }
    };

/* =========================================================
   REMOVE ROLE FROM USER
   ========================================================= */

export const removeFromUser =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const roleId =
                parseId(req.params.id);

            const userId =
                parseId(
                    req.params.userId
                );

            if (
                roleId === null ||
                userId === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid role or user id",
                });
            }

            await removeRoleFromUser(
                userId,
                roleId
            );

            return res.status(200).json({
                success: true,
                message:
                    "Role removed from user successfully",
            });
        } catch (error) {
            return handleRoleError(
                error,
                res
            );
        }
    };

/* =========================================================
   GET USER EFFECTIVE PERMISSIONS
   ========================================================= */

export const getUserAccess =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const userId =
                parseId(
                    req.params.userId
                );

            if (userId === null) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user id",
                });
            }

            const result =
                await getUserPermissions(
                    userId
                );

            return res.status(200).json({
                success: true,

                data: result,
            });
        } catch (error) {
            return handleRoleError(
                error,
                res
            );
        }
    };