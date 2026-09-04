import type { Request, Response } from "express";

import {
    createOrganization,
    getAllOrganizations,
    getOrganizationById,
    updateOrganization,
} from "../services/organization.service.js";

export const create = async (
    req: Request,
    res: Response
) => {
    try {
        const { name, code } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Organization name and code are required",
            });
        }

        const organization =
            await createOrganization({
                name,
                code,
            });

        return res.status(201).json({
            success: true,
            message:
                "Organization created successfully",
            data: {
                organization,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "ORGANIZATION_CODE_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Organization code already exists",
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
    req: Request,
    res: Response
) => {
    try {
        const organizations =
            await getAllOrganizations();

        return res.status(200).json({
            success: true,
            data: {
                organizations,
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

export const getOne = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization id",
            });
        }

        const organization =
            await getOrganizationById(id);

        return res.status(200).json({
            success: true,
            data: {
                organization,
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
                message: "Organization not found",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const patch = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization id",
            });
        }

        const { name, code, status } = req.body;

        if (
            status !== undefined &&
            !["ACTIVE", "SUSPENDED"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization status",
            });
        }

        const organization =
            await updateOrganization(id, {
                ...(name !== undefined && { name }),
                ...(code !== undefined && { code }),
                ...(status !== undefined && { status }),
            });

        return res.status(200).json({
            success: true,
            message:
                "Organization updated successfully",
            data: {
                organization,
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
                message: "Organization not found",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "ORGANIZATION_CODE_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Organization code already exists",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};