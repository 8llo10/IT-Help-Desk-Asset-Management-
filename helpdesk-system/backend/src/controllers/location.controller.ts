import type { Request, Response } from "express";

import {
    createLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
} from "../services/location.service.js";

export const create = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            code,
            branchId,
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Location name is required",
            });
        }

        if (
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Location code is required",
            });
        }

        const parsedBranchId =
            Number(branchId);

        if (
            !branchId ||
            Number.isNaN(parsedBranchId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid branch id is required",
            });
        }

        const location =
            await createLocation({
                name,
                code,
                branchId: parsedBranchId,
            });

        return res.status(201).json({
            success: true,
            message:
                "Location created successfully",
            data: {
                location,
            },
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }

        if (
            error.message ===
            "BRANCH_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
            });
        }

        if (
            error.message ===
            "LOCATION_CODE_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Location code already exists in this branch",
            });
        }

        if (
            error.message ===
            "INVALID_LOCATION_NAME"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid location name",
            });
        }

        if (
            error.message ===
            "INVALID_LOCATION_CODE"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid location code",
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
        let branchId: number | undefined;

        if (
            req.query.branchId !== undefined
        ) {
            const parsedBranchId =
                Number(req.query.branchId);

            if (
                Number.isNaN(parsedBranchId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid branch id",
                });
            }

            branchId = parsedBranchId;
        }

        const locations =
            branchId !== undefined
                ? await getAllLocations(branchId)
                : await getAllLocations();

        return res.status(200).json({
            success: true,
            data: {
                locations,
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
        const id =
            Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid location id",
            });
        }

        const location =
            await getLocationById(id);

        return res.status(200).json({
            success: true,
            data: {
                location,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "LOCATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
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
        const id =
            Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid location id",
            });
        }

        const {
            name,
            code,
            status,
        } = req.body;

        if (
            name !== undefined &&
            (
                typeof name !== "string" ||
                !name.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid location name",
            });
        }

        if (
            code !== undefined &&
            (
                typeof code !== "string" ||
                !code.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid location code",
            });
        }

        if (
            status !== undefined &&
            ![
                "ACTIVE",
                "INACTIVE",
            ].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid location status",
            });
        }

        const updateData: {
            name?: string;
            code?: string;
            status?: "ACTIVE" | "INACTIVE";
        } = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (code !== undefined) {
            updateData.code = code;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        const location =
            await updateLocation(
                id,
                updateData
            );

        return res.status(200).json({
            success: true,
            message:
                "Location updated successfully",
            data: {
                location,
            },
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }

        if (
            error.message ===
            "LOCATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        if (
            error.message ===
            "LOCATION_CODE_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Location code already exists in this branch",
            });
        }

        if (
            error.message ===
            "INVALID_LOCATION_NAME"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid location name",
            });
        }

        if (
            error.message ===
            "INVALID_LOCATION_CODE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid location code",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};