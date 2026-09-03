// src/services/category.service.ts

import prisma from "../config/prisma.js";

export const createCategory = async (name: string) => {
    return prisma.category.create({
        data: {
            name,
        },
    });
};

export const getAllCategories = async () => {
    return prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
    });
};