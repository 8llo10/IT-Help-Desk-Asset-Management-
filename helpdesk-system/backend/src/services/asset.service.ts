import prisma from "../config/prisma.js";

import {
    createNotification,
} from "./notification.service.js";

interface CreateAssetInput {
    assetTag: string;
    type: string;
    brand?: string;
    model?: string;
    serialNumber?: string;

    status?:
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";

    assignedUserId?: number | null;
    departmentId?: number | null;

    purchaseDate?: Date;
    warrantyExpiry?: Date;
}

interface UpdateAssetInput {
    assetTag?: string;
    type?: string;

    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;

    status?:
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";

    assignedUserId?: number | null;
    departmentId?: number | null;

    purchaseDate?: Date | null;
    warrantyExpiry?: Date | null;
}

/* =========================================================
   CREATE ASSET
   ========================================================= */

export const createAsset = async (
    data: CreateAssetInput
) => {
    const asset =
        await prisma.asset.create({
            data,
        });

    /* =====================================================
       NOTIFY ASSIGNED USER
       ===================================================== */

    if (
        asset.assignedUserId !== null
    ) {
        await createNotification({
            userId:
                asset.assignedUserId,

            type:
                "ASSET_ASSIGNED",

            title:
                "Asset assigned",

            message:
                `Asset ${asset.assetTag} has been assigned to you.`,

            entityType:
                "ASSET",

            entityId:
                asset.id,
        });
    }

    return asset;
};

/* =========================================================
   GET ALL ASSETS
   ========================================================= */

export const getAllAssets =
    async () => {
        return prisma.asset.findMany({
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },

                department: true,
            },

            orderBy: {
                createdAt:
                    "desc",
            },
        });
    };

/* =========================================================
   UPDATE ASSET
   ========================================================= */

export const updateAsset = async (
    id: number,
    data: UpdateAssetInput
) => {
    const existingAsset =
        await prisma.asset.findUnique({
            where: {
                id,
            },
        });

    if (!existingAsset) {
        throw new Error(
            "ASSET_NOT_FOUND"
        );
    }

    const updatedAsset =
        await prisma.asset.update({
            where: {
                id,
            },

            data,
        });

    /* =====================================================
       ASSET ASSIGNMENT NOTIFICATIONS
       ===================================================== */

    if (
        data.assignedUserId !==
        undefined
    ) {
        const oldUserId =
            existingAsset.assignedUserId;

        const newUserId =
            data.assignedUserId;

        /* =================================================
           ASSIGN

           null -> user
           ================================================= */

        if (
            oldUserId === null &&
            newUserId !== null
        ) {
            await createNotification({
                userId:
                    newUserId,

                type:
                    "ASSET_ASSIGNED",

                title:
                    "Asset assigned",

                message:
                    `Asset ${updatedAsset.assetTag} has been assigned to you.`,

                entityType:
                    "ASSET",

                entityId:
                    updatedAsset.id,
            });
        }

        /* =================================================
           UNASSIGN

           user -> null
           ================================================= */

        if (
            oldUserId !== null &&
            newUserId === null
        ) {
            await createNotification({
                userId:
                    oldUserId,

                type:
                    "ASSET_UNASSIGNED",

                title:
                    "Asset unassigned",

                message:
                    `Asset ${updatedAsset.assetTag} is no longer assigned to you.`,

                entityType:
                    "ASSET",

                entityId:
                    updatedAsset.id,
            });
        }

        /* =================================================
           TRANSFER

           user A -> user B
           ================================================= */

        if (
            oldUserId !== null &&
            newUserId !== null &&
            oldUserId !== newUserId
        ) {
            /*
             * Notify previous user
             */
            await createNotification({
                userId:
                    oldUserId,

                type:
                    "ASSET_TRANSFERRED",

                title:
                    "Asset transferred",

                message:
                    `Asset ${updatedAsset.assetTag} has been transferred from your account.`,

                entityType:
                    "ASSET",

                entityId:
                    updatedAsset.id,
            });

            /*
             * Notify new user
             */
            await createNotification({
                userId:
                    newUserId,

                type:
                    "ASSET_TRANSFERRED",

                title:
                    "Asset transferred to you",

                message:
                    `Asset ${updatedAsset.assetTag} has been transferred to you.`,

                entityType:
                    "ASSET",

                entityId:
                    updatedAsset.id,
            });
        }
    }

    return updatedAsset;
};