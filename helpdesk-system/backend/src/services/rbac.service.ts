import prisma from "../config/prisma.js";

/* =========================================================
   CHECK USER PERMISSION
   ========================================================= */

export const userHasPermission = async (
    userId: number,
    permissionCode: string
) => {
    const normalizedCode =
        permissionCode
            .trim()
            .toUpperCase();

    const user =
        await prisma.user.findUnique({
            where: {
                id: userId,
            },

            select: {
                id: true,
                role: true,
                isActive: true,

                systemRoles: {
                    select: {
                        role: {
                            select: {
                                permissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                code: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

    if (!user) {
        throw new Error(
            "USER_NOT_FOUND"
        );
    }

    if (!user.isActive) {
        throw new Error(
            "USER_INACTIVE"
        );
    }

    /*
      حاليًا نخلي الـADMIN الأساسي
      يملك Full Access كـfallback
      حتى ما نكسر النظام القديم.

      لاحقًا إذا قررنا أن حتى الـAdmin
      لازم يخضع للPermissions فقط،
      نشيل هذا الشرط.
    */
    if (user.role === "ADMIN") {
        return true;
    }

    for (
        const assignment of
        user.systemRoles
    ) {
        for (
            const rolePermission of
            assignment.role.permissions
        ) {
            if (
                rolePermission.permission.code
                    .toUpperCase() ===
                normalizedCode
            ) {
                return true;
            }
        }
    }

    return false;
};

/* =========================================================
   CHECK MULTIPLE PERMISSIONS - ANY
   ========================================================= */

export const userHasAnyPermission =
    async (
        userId: number,
        permissionCodes: string[]
    ) => {
        if (
            permissionCodes.length === 0
        ) {
            return false;
        }

        const normalizedCodes =
            permissionCodes.map(
                (code) =>
                    code
                        .trim()
                        .toUpperCase()
            );

        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },

                select: {
                    role: true,
                    isActive: true,

                    systemRoles: {
                        select: {
                            role: {
                                select: {
                                    permissions: {
                                        select: {
                                            permission: {
                                                select: {
                                                    code: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

        if (!user) {
            throw new Error(
                "USER_NOT_FOUND"
            );
        }

        if (!user.isActive) {
            throw new Error(
                "USER_INACTIVE"
            );
        }

        if (user.role === "ADMIN") {
            return true;
        }

        const userPermissions =
            new Set<string>();

        for (
            const assignment of
            user.systemRoles
        ) {
            for (
                const rolePermission of
                assignment.role.permissions
            ) {
                userPermissions.add(
                    rolePermission
                        .permission.code
                        .toUpperCase()
                );
            }
        }

        return normalizedCodes.some(
            (code) =>
                userPermissions.has(code)
        );
    };

/* =========================================================
   CHECK MULTIPLE PERMISSIONS - ALL
   ========================================================= */

export const userHasAllPermissions =
    async (
        userId: number,
        permissionCodes: string[]
    ) => {
        if (
            permissionCodes.length === 0
        ) {
            return true;
        }

        const normalizedCodes =
            permissionCodes.map(
                (code) =>
                    code
                        .trim()
                        .toUpperCase()
            );

        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },

                select: {
                    role: true,
                    isActive: true,

                    systemRoles: {
                        select: {
                            role: {
                                select: {
                                    permissions: {
                                        select: {
                                            permission: {
                                                select: {
                                                    code: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

        if (!user) {
            throw new Error(
                "USER_NOT_FOUND"
            );
        }

        if (!user.isActive) {
            throw new Error(
                "USER_INACTIVE"
            );
        }

        if (user.role === "ADMIN") {
            return true;
        }

        const userPermissions =
            new Set<string>();

        for (
            const assignment of
            user.systemRoles
        ) {
            for (
                const rolePermission of
                assignment.role.permissions
            ) {
                userPermissions.add(
                    rolePermission
                        .permission.code
                        .toUpperCase()
                );
            }
        }

        return normalizedCodes.every(
            (code) =>
                userPermissions.has(code)
        );
    };

/* =========================================================
   GET PERMISSION CODES FOR USER
   ========================================================= */

export const getUserPermissionCodes =
    async (
        userId: number
    ) => {
        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },

                select: {
                    id: true,
                    role: true,
                    isActive: true,

                    systemRoles: {
                        select: {
                            role: {
                                select: {
                                    permissions: {
                                        select: {
                                            permission: {
                                                select: {
                                                    code: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

        if (!user) {
            throw new Error(
                "USER_NOT_FOUND"
            );
        }

        const permissions =
            new Set<string>();

        for (
            const assignment of
            user.systemRoles
        ) {
            for (
                const rolePermission of
                assignment.role.permissions
            ) {
                permissions.add(
                    rolePermission
                        .permission.code
                        .toUpperCase()
                );
            }
        }

        return Array.from(
            permissions
        ).sort();
    };