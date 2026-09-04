import type { Request, Response } from "express";

import {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
} from "../services/permission.service.js";

/* =========================================================
   ERROR HANDLER
   ========================================================= */

const handlePermissionError = (
    error: unknown,
    res: Response
) => {
    if (!(error instanceof Error)) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

    const errorMap: Record<
        string,
        {
            status: number;
            message: string;
        }
    > = {
        PERMISSION_CODE_EXISTS: {
            status: 409,
            message: "Permission code already exists",
        },

        PERMISSION_NOT_FOUND: {
            status: 404,
            message: "Permission not found",
        },

        INVALID_PERMISSION_NAME: {
            status: 400,
            message: "Invalid permission name",
        },

        PERMISSION_IN_USE: {
            status: 409,
            message:
                "Permission cannot be deleted because it is assigned to one or more roles",
        },
    };

    const mapped = errorMap[error.message];

    if (mapped) {
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};

/* =========================================================
   CREATE
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
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Permission name is required",
            });
        }

        if (
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Permission code is required",
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

        const data: {
            name: string;
            code: string;
            description?: string;
        } = {
            name,
            code,
        };

        if (
            typeof description === "string"
        ) {
            data.description = description;
        }

        const permission =
            await createPermission(data);

        return res.status(201).json({
            success: true,
            message:
                "Permission created successfully",
            data: {
                permission,
            },
        });
    } catch (error) {
        return handlePermissionError(
            error,
            res
        );
    }
};

/* =========================================================
   GET ALL
   ========================================================= */

export const getAll = async (
    req: Request,
    res: Response
) => {
    try {
        const permissions =
            await getAllPermissions();

        return res.status(200).json({
            success: true,
            data: {
                permissions,
            },
        });
    } catch (error) {
        return handlePermissionError(
            error,
            res
        );
    }
};

/* =========================================================
   GET ONE
   ========================================================= */

export const getOne = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            Number(req.params.id);

        if (
            Number.isNaN(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid permission id",
            });
        }

        const permission =
            await getPermissionById(id);

        return res.status(200).json({
            success: true,
            data: {
                permission,
            },
        });
    } catch (error) {
        return handlePermissionError(
            error,
            res
        );
    }
};

/* =========================================================
   UPDATE
   ========================================================= */

export const patch = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            Number(req.params.id);

        if (
            Number.isNaN(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid permission id",
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
                        "Permission name must be a string",
                });
            }

            updateData.name = name;
        }

        if (description !== undefined) {
            if (
                typeof description !== "string"
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

        const permission =
            await updatePermission(
                id,
                updateData
            );

        return res.status(200).json({
            success: true,
            message:
                "Permission updated successfully",
            data: {
                permission,
            },
        });
    } catch (error) {
        return handlePermissionError(
            error,
            res
        );
    }
};

/* =========================================================
   DELETE
   ========================================================= */

export const remove = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            Number(req.params.id);

        if (
            Number.isNaN(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid permission id",
            });
        }

        await deletePermission(id);

        return res.status(200).json({
            success: true,
            message:
                "Permission deleted successfully",
        });
    } catch (error) {
        return handlePermissionError(
            error,
            res
        );
    }
};