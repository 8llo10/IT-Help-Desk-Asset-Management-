import prisma from "../config/prisma.js";

interface CreateLocationInput {
    name: string;
    code: string;
    branchId: number;
}

interface UpdateLocationInput {
    name?: string;
    code?: string;
    status?: "ACTIVE" | "INACTIVE";
}

export const createLocation = async (
    data: CreateLocationInput
) => {
    const branch = await prisma.branch.findUnique({
        where: {
            id: data.branchId,
        },
    });

    if (!branch) {
        throw new Error("BRANCH_NOT_FOUND");
    }

    const normalizedCode =
        data.code.trim().toUpperCase();

    const existingLocation =
        await prisma.location.findFirst({
            where: {
                branchId: data.branchId,
                code: normalizedCode,
            },
        });

    if (existingLocation) {
        throw new Error("LOCATION_CODE_EXISTS");
    }

    return prisma.location.create({
        data: {
            name: data.name.trim(),
            code: normalizedCode,
            branchId: data.branchId,
        },

        include: {
            branch: {
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
        },
    });
};

export const getAllLocations = async (
    branchId?: number
) => {
    if (branchId !== undefined) {
        return prisma.location.findMany({
            where: {
                branchId,
            },

            include: {
                branch: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        organizationId: true,
                    },
                },

                _count: {
                    select: {
                        users: true,
                        assets: true,
                    },
                },
            },

            orderBy: {
                name: "asc",
            },
        });
    }

    return prisma.location.findMany({
        include: {
            branch: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    organizationId: true,
                },
            },

            _count: {
                select: {
                    users: true,
                    assets: true,
                },
            },
        },

        orderBy: {
            name: "asc",
        },
    });
};

export const getLocationById = async (
    id: number
) => {
    const location =
        await prisma.location.findUnique({
            where: {
                id,
            },

            include: {
                branch: {
                    include: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },

                users: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },

                    orderBy: {
                        fullName: "asc",
                    },
                },

                assets: {
                    select: {
                        id: true,
                        assetTag: true,
                        type: true,
                        brand: true,
                        model: true,
                        status: true,
                    },

                    orderBy: {
                        assetTag: "asc",
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

    if (!location) {
        throw new Error("LOCATION_NOT_FOUND");
    }

    return location;
};

export const updateLocation = async (
    id: number,
    data: UpdateLocationInput
) => {
    const location =
        await prisma.location.findUnique({
            where: {
                id,
            },
        });

    if (!location) {
        throw new Error("LOCATION_NOT_FOUND");
    }

    if (
        data.name !== undefined &&
        !data.name.trim()
    ) {
        throw new Error("INVALID_LOCATION_NAME");
    }

    if (
        data.code !== undefined &&
        !data.code.trim()
    ) {
        throw new Error("INVALID_LOCATION_CODE");
    }

    if (data.code !== undefined) {
        const normalizedCode =
            data.code.trim().toUpperCase();

        if (normalizedCode !== location.code) {
            const existingLocation =
                await prisma.location.findFirst({
                    where: {
                        branchId: location.branchId,
                        code: normalizedCode,

                        NOT: {
                            id,
                        },
                    },
                });

            if (existingLocation) {
                throw new Error(
                    "LOCATION_CODE_EXISTS"
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
        updateData.name = data.name.trim();
    }

    if (data.code !== undefined) {
        updateData.code =
            data.code.trim().toUpperCase();
    }

    if (data.status !== undefined) {
        updateData.status = data.status;
    }

    return prisma.location.update({
        where: {
            id,
        },

        data: updateData,

        include: {
            branch: {
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
        },
    });
};