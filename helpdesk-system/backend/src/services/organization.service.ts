import prisma from "../config/prisma.js";

interface CreateOrganizationInput {
    name: string;
    code: string;
}

interface UpdateOrganizationInput {
    name?: string;
    code?: string;
    status?: "ACTIVE" | "SUSPENDED";
}

export const createOrganization = async (
    data: CreateOrganizationInput
) => {
    const existingCode =
        await prisma.organization.findUnique({
            where: {
                code: data.code.toUpperCase(),
            },
        });

    if (existingCode) {
        throw new Error("ORGANIZATION_CODE_EXISTS");
    }

    return prisma.organization.create({
        data: {
            name: data.name.trim(),
            code: data.code.trim().toUpperCase(),
        },
    });
};

export const getAllOrganizations = async () => {
    return prisma.organization.findMany({
        include: {
            _count: {
                select: {
                    branches: true,
                    departments: true,
                    teams: true,
                    users: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getOrganizationById = async (
    id: number
) => {
    const organization =
        await prisma.organization.findUnique({
            where: {
                id,
            },

            include: {
                branches: {
                    orderBy: {
                        name: "asc",
                    },
                },

                departments: {
                    orderBy: {
                        name: "asc",
                    },
                },

                teams: {
                    orderBy: {
                        name: "asc",
                    },
                },

                _count: {
                    select: {
                        users: true,
                        branches: true,
                        departments: true,
                        teams: true,
                    },
                },
            },
        });

    if (!organization) {
        throw new Error("ORGANIZATION_NOT_FOUND");
    }

    return organization;
};

export const updateOrganization = async (
    id: number,
    data: UpdateOrganizationInput
) => {
    const organization =
        await prisma.organization.findUnique({
            where: {
                id,
            },
        });

    if (!organization) {
        throw new Error("ORGANIZATION_NOT_FOUND");
    }

    if (
        data.code &&
        data.code.toUpperCase() !== organization.code
    ) {
        const existingCode =
            await prisma.organization.findUnique({
                where: {
                    code: data.code.toUpperCase(),
                },
            });

        if (existingCode) {
            throw new Error("ORGANIZATION_CODE_EXISTS");
        }
    }

    return prisma.organization.update({
        where: {
            id,
        },

        data: {
            ...(data.name !== undefined && {
                name: data.name.trim(),
            }),

            ...(data.code !== undefined && {
                code: data.code.trim().toUpperCase(),
            }),

            ...(data.status !== undefined && {
                status: data.status,
            }),
        },
    });
};