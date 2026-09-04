import prisma from "../config/prisma.js";

interface CreateBranchInput {
    name: string;
    code: string;
    organizationId: number;
}

interface UpdateBranchInput {
    name?: string;
    code?: string;
    status?: "ACTIVE" | "INACTIVE";
}

export const createBranch = async (
    data: CreateBranchInput
) => {
    const organization =
        await prisma.organization.findUnique({
            where: {
                id: data.organizationId,
            },
        });

    if (!organization) {
        throw new Error(
            "ORGANIZATION_NOT_FOUND"
        );
    }

    const normalizedCode =
        data.code.trim().toUpperCase();

    const existingBranch =
        await prisma.branch.findFirst({
            where: {
                organizationId:
                    data.organizationId,
                code: normalizedCode,
            },
        });

    if (existingBranch) {
        throw new Error(
            "BRANCH_CODE_EXISTS"
        );
    }

    return prisma.branch.create({
        data: {
            name: data.name.trim(),
            code: normalizedCode,
            organizationId:
                data.organizationId,
        },

        include: {
            organization: true,
        },
    });
};

export const getAllBranches = async (
    organizationId?: number
) => {
    if (organizationId !== undefined) {
        return prisma.branch.findMany({
            where: {
                organizationId,
            },

            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },

                _count: {
                    select: {
                        users: true,
                        departments: true,
                        teams: true,
                        locations: true,
                        assets: true,
                    },
                },
            },

            orderBy: {
                name: "asc",
            },
        });
    }

    return prisma.branch.findMany({
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            _count: {
                select: {
                    users: true,
                    departments: true,
                    teams: true,
                    locations: true,
                    assets: true,
                },
            },
        },

        orderBy: {
            name: "asc",
        },
    });
};

export const getBranchById = async (
    id: number
) => {
    const branch =
        await prisma.branch.findUnique({
            where: {
                id,
            },

            include: {
                organization: true,

                locations: {
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
                        assets: true,
                    },
                },
            },
        });

    if (!branch) {
        throw new Error(
            "BRANCH_NOT_FOUND"
        );
    }

    return branch;
};

export const updateBranch = async (
    id: number,
    data: UpdateBranchInput
) => {
    const branch =
        await prisma.branch.findUnique({
            where: {
                id,
            },
        });

    if (!branch) {
        throw new Error(
            "BRANCH_NOT_FOUND"
        );
    }

    if (data.name !== undefined) {
        if (!data.name.trim()) {
            throw new Error(
                "INVALID_BRANCH_NAME"
            );
        }
    }

    if (data.code !== undefined) {
        if (!data.code.trim()) {
            throw new Error(
                "INVALID_BRANCH_CODE"
            );
        }

        const normalizedCode =
            data.code
                .trim()
                .toUpperCase();

        if (
            normalizedCode !==
            branch.code
        ) {
            const existingBranch =
                await prisma.branch.findFirst({
                    where: {
                        organizationId:
                            branch.organizationId,

                        code: normalizedCode,

                        NOT: {
                            id,
                        },
                    },
                });

            if (existingBranch) {
                throw new Error(
                    "BRANCH_CODE_EXISTS"
                );
            }
        }
    }

    const updateData: {
        name?: string;
        code?: string;
        status?: "ACTIVE" | "INACTIVE";
    } = {};

    if (data.name !== undefined) {
        updateData.name =
            data.name.trim();
    }

    if (data.code !== undefined) {
        updateData.code =
            data.code
                .trim()
                .toUpperCase();
    }

    if (data.status !== undefined) {
        updateData.status =
            data.status;
    }

    return prisma.branch.update({
        where: {
            id,
        },

        data: updateData,

        include: {
            organization: true,
        },
    });
};