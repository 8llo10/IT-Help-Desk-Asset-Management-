// src/services/user.service.ts

import prisma from "../config/prisma.js";

export const getAllUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            departmentId: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const updateUser = async (
    id: number,
    data: {
        role?: "EMPLOYEE" | "TECHNICIAN" | "ADMIN";
        isActive?: boolean;
        departmentId?: number | null;
    }
) => {
    return prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            departmentId: true,
            updatedAt: true,
        },
    });
};