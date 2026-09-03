import prisma from "../config/prisma.js";

export const createDepartment = async (name: string) => {
    return prisma.department.create({
        data: {
            name,
        },
    });
};

export const getAllDepartments = async () => {
    return prisma.department.findMany({
        orderBy: {
            name: "asc",
        },
    });
};