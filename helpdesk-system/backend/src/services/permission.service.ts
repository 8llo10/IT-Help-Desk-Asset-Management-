import prisma from "../config/prisma.js";

interface CreatePermissionInput {
    name: string;
    code: string;
    description?: string;
}

interface UpdatePermissionInput {
    name?: string;
    description?: string;
}

/**
 * Create a new permission
 */
export const createPermission = async (
    data: CreatePermissionInput
) => {
    const normalizedCode = data.code
        .trim()
        .toUpperCase();

    const existingPermission =
        await prisma.permission.findUnique({
            where: {
                code: normalizedCode,
            },
        });

    if (existingPermission) {
        throw new Error("PERMISSION_CODE_EXISTS");
    }

    return prisma.permission.create({
        data: {
            name: data.name.trim(),
            code: normalizedCode,
            description:
                data.description?.trim() || null,
        },
    });
};

/**
 * Get all permissions
 */
export const getAllPermissions = async () => {
    return prisma.permission.findMany({
        include: {
            _count: {
                select: {
                    roles: true,
                },
            },
        },

        orderBy: {
            code: "asc",
        },
    });
};

/**
 * Get one permission
 */
export const getPermissionById = async (
    id: number
) => {
    const permission =
        await prisma.permission.findUnique({
            where: {
                id,
            },

            include: {
                roles: {
                    include: {
                        role: {
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

    if (!permission) {
        throw new Error("PERMISSION_NOT_FOUND");
    }

    return permission;
};

/**
 * Update permission
 */
export const updatePermission = async (
    id: number,
    data: UpdatePermissionInput
) => {
    const permission =
        await prisma.permission.findUnique({
            where: {
                id,
            },
        });

    if (!permission) {
        throw new Error("PERMISSION_NOT_FOUND");
    }

    if (
        data.name !== undefined &&
        !data.name.trim()
    ) {
        throw new Error("INVALID_PERMISSION_NAME");
    }

    return prisma.permission.update({
        where: {
            id,
        },

        data: {
            ...(data.name !== undefined && {
                name: data.name.trim(),
            }),

            ...(data.description !== undefined && {
                description:
                    data.description.trim() || null,
            }),
        },
    });
};

/**
 * Delete permission
 *
 * Permission cannot be deleted while assigned
 * to one or more system roles.
 */
export const deletePermission = async (
    id: number
) => {
    const permission =
        await prisma.permission.findUnique({
            where: {
                id,
            },

            include: {
                _count: {
                    select: {
                        roles: true,
                    },
                },
            },
        });

    if (!permission) {
        throw new Error("PERMISSION_NOT_FOUND");
    }

    if (permission._count.roles > 0) {
        throw new Error("PERMISSION_IN_USE");
    }

    return prisma.permission.delete({
        where: {
            id,
        },
    });
};