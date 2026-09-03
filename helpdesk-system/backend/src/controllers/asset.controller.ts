import type { Request, Response } from "express";

import {
    createAsset,
    getAllAssets,
    updateAsset,
} from "../services/asset.service.js";

export const create = async (req: Request, res: Response) => {
    try {
        const {
            assetTag,
            type,
            brand,
            model,
            serialNumber,
            status,
            assignedUserId,
            departmentId,
            purchaseDate,
            warrantyExpiry,
        } = req.body;

        if (!assetTag || !type) {
            return res.status(400).json({
                success: false,
                message: "Asset tag and type are required",
            });
        }

        const assetData = {
            assetTag,
            type,

            ...(brand !== undefined && { brand }),
            ...(model !== undefined && { model }),
            ...(serialNumber !== undefined && { serialNumber }),
            ...(status !== undefined && { status }),

            ...(assignedUserId !== undefined && {
                assignedUserId,
            }),

            ...(departmentId !== undefined && {
                departmentId,
            }),

            ...(purchaseDate && {
                purchaseDate: new Date(purchaseDate),
            }),

            ...(warrantyExpiry && {
                warrantyExpiry: new Date(warrantyExpiry),
            }),
        };

        const asset = await createAsset(assetData);

        return res.status(201).json({
            success: true,
            message: "Asset created successfully",
            data: {
                asset,
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

export const getAll = async (req: Request, res: Response) => {
    try {
        const assets = await getAllAssets();

        return res.status(200).json({
            success: true,
            data: {
                assets,
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

export const patch = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid asset id",
            });
        }

        const {
            assetTag,
            type,
            brand,
            model,
            serialNumber,
            status,
            assignedUserId,
            departmentId,
            purchaseDate,
            warrantyExpiry,
        } = req.body;

        const assetData = {
            ...(assetTag !== undefined && { assetTag }),
            ...(type !== undefined && { type }),
            ...(brand !== undefined && { brand }),
            ...(model !== undefined && { model }),
            ...(serialNumber !== undefined && { serialNumber }),
            ...(status !== undefined && { status }),

            ...(assignedUserId !== undefined && {
                assignedUserId,
            }),

            ...(departmentId !== undefined && {
                departmentId,
            }),

            ...(purchaseDate !== undefined && {
                purchaseDate: purchaseDate
                    ? new Date(purchaseDate)
                    : null,
            }),

            ...(warrantyExpiry !== undefined && {
                warrantyExpiry: warrantyExpiry
                    ? new Date(warrantyExpiry)
                    : null,
            }),
        };

        const asset = await updateAsset(id, assetData);

        return res.status(200).json({
            success: true,
            message: "Asset updated successfully",
            data: {
                asset,
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