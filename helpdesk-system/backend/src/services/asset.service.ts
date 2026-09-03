import prisma from "../config/prisma.js";

interface CreateAssetInput {
    assetTag: string;
    type: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    status?: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";
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
    status?: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";
    assignedUserId?: number | null;
    departmentId?: number | null;
    purchaseDate?: Date | null;
    warrantyExpiry?: Date | null;
}

export const createAsset = async (data: CreateAssetInput) => {
    return prisma.asset.create({
        data,
    });
};

export const getAllAssets = async () => {
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
            createdAt: "desc",
        },
    });
};

export const updateAsset = async (
    id: number,
    data: UpdateAssetInput
) => {
    return prisma.asset.update({
        where: {
            id,
        },
        data,
    });
};