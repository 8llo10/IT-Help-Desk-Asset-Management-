import prisma from "../config/prisma.js";

interface CreateRoleInput {
    name: string;
    code: string;
    description?: string;
    organizationId?: number;
}

interface UpdateRoleInput {
    name?: string;
    description?: string;
}

/* =========================================================
   CREATE ROLE
   ========================================================= */

export const createRole = async (
    data: CreateRoleInput
) => {
    const normalizedCode =
        data.code.trim().toUpperCase();

    if (!data.name.trim()) {
        throw new Error("INVALID_ROLE_NAME");
    }

    if (!normalizedCode) {
        throw new Error("INVALID_ROLE_CODE");
    }

    if (data.organizationId !== undefined) {
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
    }

    const existingRole =
        await prisma.systemRole.findFirst({
            where: {
                code: normalizedCode,
                organizationId:
                    data.organizationId ?? null,
            },
        });

    if (existingRole) {
        throw new Error("ROLE_CODE_EXISTS");
    }

    const createData: {
        name: string;
        code: string;
        description?: string;
        organizationId?: number;
    } = {
        name: data.name.trim(),
        code: normalizedCode,
    };

    if (
        data.description !== undefined &&
        data.description.trim()
    ) {
        createData.description =
            data.description.trim();
    }

    if (data.organizationId !== undefined) {
        createData.organizationId =
            data.organizationId;
    }

    return prisma.systemRole.create({
        data: createData,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            permissions: {
                include: {
                    permission: true,
                },
            },

            _count: {
                select: {
                    users: true,
                    permissions: true,
                },
            },
        },
    });
};

/* =========================================================
   GET ALL ROLES
   ========================================================= */

export const getAllRoles = async (
    organizationId?: number
) => {
    if (organizationId !== undefined) {
        return prisma.systemRole.findMany({
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

                permissions: {
                    include: {
                        permission: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        users: true,
                        permissions: true,
                    },
                },
            },

            orderBy: {
                name: "asc",
            },
        });
    }

    return prisma.systemRole.findMany({
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            permissions: {
                include: {
                    permission: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },

            _count: {
                select: {
                    users: true,
                    permissions: true,
                },
            },
        },

        orderBy: {
            name: "asc",
        },
    });
};

/* =========================================================
   GET ROLE BY ID
   ========================================================= */

export const getRoleById = async (
    id: number
) => {
    const role =
        await prisma.systemRole.findUnique({
            where: {
                id,
            },

            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },

                permissions: {
                    include: {
                        permission: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                description: true,
                            },
                        },
                    },
                },

                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                role: true,
                                isActive: true,
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        users: true,
                        permissions: true,
                    },
                },
            },
        });

    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }

    return role;
};

/* =========================================================
   UPDATE ROLE
   ========================================================= */

export const updateRole = async (
    id: number,
    data: UpdateRoleInput
) => {
    const role =
        await prisma.systemRole.findUnique({
            where: {
                id,
            },
        });

    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }

    if (
        data.name !== undefined &&
        !data.name.trim()
    ) {
        throw new Error("INVALID_ROLE_NAME");
    }

    const updateData: {
        name?: string;
        description?: string | null;
    } = {};

    if (data.name !== undefined) {
        updateData.name =
            data.name.trim();
    }

    if (data.description !== undefined) {
        updateData.description =
            data.description.trim() || null;
    }

    return prisma.systemRole.update({
        where: {
            id,
        },

        data: updateData,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            permissions: {
                include: {
                    permission: {
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

/* =========================================================
   ASSIGN PERMISSION TO ROLE
   ========================================================= */

export const assignPermissionToRole = async (
    roleId: number,
    permissionId: number
) => {
    const role =
        await prisma.systemRole.findUnique({
            where: {
                id: roleId,
            },
        });

    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }

    const permission =
        await prisma.permission.findUnique({
            where: {
                id: permissionId,
            },
        });

    if (!permission) {
        throw new Error(
            "PERMISSION_NOT_FOUND"
        );
    }

    const existingAssignment =
        await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });

    if (existingAssignment) {
        throw new Error(
            "PERMISSION_ALREADY_ASSIGNED"
        );
    }

    return prisma.rolePermission.create({
        data: {
            roleId,
            permissionId,
        },

        include: {
            role: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            permission: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
};

/* =========================================================
   REMOVE PERMISSION FROM ROLE
   ========================================================= */

export const removePermissionFromRole = async (
    roleId: number,
    permissionId: number
) => {
    const assignment =
        await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });

    if (!assignment) {
        throw new Error(
            "ROLE_PERMISSION_NOT_FOUND"
        );
    }

    return prisma.rolePermission.delete({
        where: {
            roleId_permissionId: {
                roleId,
                permissionId,
            },
        },
    });
};

/* =========================================================
   ASSIGN ROLE TO USER
   ========================================================= */

export const assignRoleToUser = async (
    userId: number,
    roleId: number
) => {
    const user =
        await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const role =
        await prisma.systemRole.findUnique({
            where: {
                id: roleId,
            },
        });

    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }

    if (
        role.organizationId !== null &&
        user.organizationId !== null &&
        role.organizationId !==
        user.organizationId
    ) {
        throw new Error(
            "ROLE_ORGANIZATION_MISMATCH"
        );
    }

    const existingAssignment =
        await prisma.userSystemRole.findUnique({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
        });

    if (existingAssignment) {
        throw new Error(
            "ROLE_ALREADY_ASSIGNED"
        );
    }

    return prisma.userSystemRole.create({
        data: {
            userId,
            roleId,
        },

        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },

            role: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
};

/* =========================================================
   REMOVE ROLE FROM USER
   ========================================================= */

export const removeRoleFromUser = async (
    userId: number,
    roleId: number
) => {
    const assignment =
        await prisma.userSystemRole.findUnique({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
        });

    if (!assignment) {
        throw new Error(
            "USER_ROLE_NOT_FOUND"
        );
    }

    return prisma.userSystemRole.delete({
        where: {
            userId_roleId: {
                userId,
                roleId,
            },
        },
    });
};

/* =========================================================
   GET USER PERMISSIONS
   ========================================================= */

export const getUserPermissions = async (
    userId: number
) => {
    const user =
        await prisma.user.findUnique({
            where: {
                id: userId,
            },

            include: {
                systemRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const permissionMap =
        new Map<
            string,
            {
                id: number;
                name: string;
                code: string;
            }
        >();

    for (
        const userRole of
        user.systemRoles
    ) {
        for (
            const rolePermission of
            userRole.role.permissions
        ) {
            const permission =
                rolePermission.permission;

            permissionMap.set(
                permission.code,
                {
                    id: permission.id,
                    name: permission.name,
                    code: permission.code,
                }
            );
        }
    }

    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            baseRole: user.role,
        },

        roles:
            user.systemRoles.map(
                (assignment) => ({
                    id: assignment.role.id,
                    name: assignment.role.name,
                    code: assignment.role.code,
                })
            ),

        permissions:
            Array.from(
                permissionMap.values()
            ),
    };
};