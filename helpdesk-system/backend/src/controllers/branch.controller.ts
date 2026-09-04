import type {
    Request,
    Response,
} from "express";

import {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
} from "../services/branch.service.js";

export const create = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            code,
            organizationId,
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof code !== "string" ||
            !code.trim() ||
            !organizationId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, code and organization id are required",
            });
        }

        const branch =
            await createBranch({
                name,
                code,
                organizationId:
                    Number(organizationId),
            });

        return res.status(201).json({
            success: true,
            message:
                "Branch created successfully",
            data: {
                branch,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "ORGANIZATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Organization not found",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "BRANCH_CODE_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Branch code already exists",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

export const getAll = async (
    req: Request,
    res: Response
) => {
    try {
        const organizationId =
            req.query.organizationId
                ? Number(
                    req.query.organizationId
                )
                : undefined;

        if (
            organizationId !== undefined &&
            Number.isNaN(
                organizationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid organization id",
            });
        }

        const branches =
            await getAllBranches(
                organizationId
            );

        return res.status(200).json({
            success: true,
            data: {
                branches,
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
};

export const getOne = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid branch id",
            });
        }

        const branch =
            await getBranchById(id);

        return res.status(200).json({
            success: true,
            data: {
                branch,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "BRANCH_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Branch not found",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

export const patch = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid branch id",
            });
        }

        const {
            name,
            code,
            status,
        } = req.body;

        if (
            status !== undefined &&
            ![
                "ACTIVE",
                "INACTIVE",
            ].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid branch status",
            });
        }

        const branch =
            await updateBranch(
                id,
                {
                    ...(name !== undefined && {
                        name,
                    }),

                    ...(code !== undefined && {
                        code,
                    }),

                    ...(status !== undefined && {
                        status,
                    }),
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "Branch updated successfully",
            data: {
                branch,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "BRANCH_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Branch not found",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "BRANCH_CODE_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Branch code already exists",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};