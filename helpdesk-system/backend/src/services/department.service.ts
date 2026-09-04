import prisma from "../config/prisma.js";

interface CreateDepartmentInput {
    name: string;
    organizationId?: number;
    branchId?: number;
}

interface UpdateDepartmentInput {
    name?: string;
    organizationId?: number | null;
    branchId?: number | null;
}

/* =========================================================
   CREATE DEPARTMENT
   ========================================================= */

export const createDepartment = async (
    data: CreateDepartmentInput
) => {
    const normalizedName =
        data.name.trim();

    if (!normalizedName) {
        throw new Error(
            "INVALID_DEPARTMENT_NAME"
        );
    }

    let organizationId =
        data.organizationId;

    let branchId =
        data.branchId;

    /* =======================================================
       ORGANIZATION
       ======================================================= */

    if (
        organizationId !== undefined
    ) {
        const organization =
            await prisma.organization.findUnique({
                where: {
                    id: organizationId,
                },
            });

        if (!organization) {
            throw new Error(
                "ORGANIZATION_NOT_FOUND"
            );
        }

        if (
            organization.status !== "ACTIVE"
        ) {
            throw new Error(
                "ORGANIZATION_INACTIVE"
            );
        }
    }

    /* =======================================================
       BRANCH
       ======================================================= */

    if (branchId !== undefined) {
        const branch =
            await prisma.branch.findUnique({
                where: {
                    id: branchId,
                },
            });

        if (!branch) {
            throw new Error(
                "BRANCH_NOT_FOUND"
            );
        }

        if (
            branch.status !== "ACTIVE"
        ) {
            throw new Error(
                "BRANCH_INACTIVE"
            );
        }

        if (
            organizationId !== undefined &&
            branch.organizationId !==
            organizationId
        ) {
            throw new Error(
                "BRANCH_ORGANIZATION_MISMATCH"
            );
        }

        if (
            organizationId === undefined
        ) {
            organizationId =
                branch.organizationId;
        }
    }

    /* =======================================================
       DUPLICATE CHECK
       ======================================================= */

    const existingDepartment =
        await prisma.department.findFirst({
            where: {
                name: {
                    equals: normalizedName,
                    mode: "insensitive",
                },

                ...(organizationId !==
                    undefined && {
                    organizationId,
                }),
            },
        });

    if (existingDepartment) {
        throw new Error(
            "DEPARTMENT_ALREADY_EXISTS"
        );
    }

    /* =======================================================
       CREATE DATA
       ======================================================= */

    const createData: {
        name: string;
        organizationId?: number;
        branchId?: number;
    } = {
        name: normalizedName,
    };

    if (
        organizationId !== undefined
    ) {
        createData.organizationId =
            organizationId;
    }

    if (branchId !== undefined) {
        createData.branchId =
            branchId;
    }

    return prisma.department.create({
        data: createData,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            branch: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            _count: {
                select: {
                    users: true,
                    assets: true,
                    teams: true,
                },
            },
        },
    });
};

/* =========================================================
   GET ALL DEPARTMENTS
   ========================================================= */

export const getAllDepartments = async (
    organizationId?: number,
    branchId?: number
) => {
    const where: {
        organizationId?: number;
        branchId?: number;
    } = {};

    if (
        organizationId !== undefined
    ) {
        where.organizationId =
            organizationId;
    }

    if (branchId !== undefined) {
        where.branchId =
            branchId;
    }

    return prisma.department.findMany({
        where,

        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            branch: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            _count: {
                select: {
                    users: true,
                    assets: true,
                    teams: true,
                },
            },
        },

        orderBy: {
            name: "asc",
        },
    });
};

/* =========================================================
   GET DEPARTMENT BY ID
   ========================================================= */

export const getDepartmentById = async (
    id: number
) => {
    const department =
        await prisma.department.findUnique({
            where: {
                id,
            },

            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        status: true,
                    },
                },

                branch: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        status: true,
                    },
                },

                users: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        employeeNumber: true,
                        jobTitle: true,
                        role: true,
                        isActive: true,
                    },

                    orderBy: {
                        fullName: "asc",
                    },
                },

                teams: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },

                    orderBy: {
                        name: "asc",
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
                        teams: true,
                    },
                },
            },
        });

    if (!department) {
        throw new Error(
            "DEPARTMENT_NOT_FOUND"
        );
    }

    return department;
};

/* =========================================================
   UPDATE DEPARTMENT
   ========================================================= */

export const updateDepartment = async (
    id: number,
    data: UpdateDepartmentInput
) => {
    const department =
        await prisma.department.findUnique({
            where: {
                id,
            },
        });

    if (!department) {
        throw new Error(
            "DEPARTMENT_NOT_FOUND"
        );
    }

    if (
        data.name !== undefined &&
        !data.name.trim()
    ) {
        throw new Error(
            "INVALID_DEPARTMENT_NAME"
        );
    }

    const targetOrganizationId =
        data.organizationId !== undefined
            ? data.organizationId
            : department.organizationId;

    const targetBranchId =
        data.branchId !== undefined
            ? data.branchId
            : department.branchId;

    /* =======================================================
       ORGANIZATION
       ======================================================= */

    if (
        targetOrganizationId !== null
    ) {
        const organization =
            await prisma.organization.findUnique({
                where: {
                    id: targetOrganizationId,
                },
            });

        if (!organization) {
            throw new Error(
                "ORGANIZATION_NOT_FOUND"
            );
        }

        if (
            organization.status !== "ACTIVE"
        ) {
            throw new Error(
                "ORGANIZATION_INACTIVE"
            );
        }
    }

    /* =======================================================
       BRANCH
       ======================================================= */

    if (targetBranchId !== null) {
        const branch =
            await prisma.branch.findUnique({
                where: {
                    id: targetBranchId,
                },
            });

        if (!branch) {
            throw new Error(
                "BRANCH_NOT_FOUND"
            );
        }

        if (
            branch.status !== "ACTIVE"
        ) {
            throw new Error(
                "BRANCH_INACTIVE"
            );
        }

        if (
            targetOrganizationId !== null &&
            branch.organizationId !==
            targetOrganizationId
        ) {
            throw new Error(
                "BRANCH_ORGANIZATION_MISMATCH"
            );
        }
    }

    /* =======================================================
       DUPLICATE CHECK
       ======================================================= */

    if (data.name !== undefined) {
        const existingDepartment =
            await prisma.department.findFirst({
                where: {
                    name: {
                        equals:
                            data.name.trim(),
                        mode: "insensitive",
                    },

                    organizationId:
                        targetOrganizationId,

                    NOT: {
                        id,
                    },
                },
            });

        if (existingDepartment) {
            throw new Error(
                "DEPARTMENT_ALREADY_EXISTS"
            );
        }
    }

    /* =======================================================
       UPDATE DATA
       ======================================================= */

    const updateData: {
        name?: string;
        organizationId?: number | null;
        branchId?: number | null;
    } = {};

    if (data.name !== undefined) {
        updateData.name =
            data.name.trim();
    }

    if (
        data.organizationId !== undefined
    ) {
        updateData.organizationId =
            data.organizationId;
    }

    if (
        data.branchId !== undefined
    ) {
        updateData.branchId =
            data.branchId;
    }

    return prisma.department.update({
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

            branch: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },

            _count: {
                select: {
                    users: true,
                    assets: true,
                    teams: true,
                },
            },
        },
    });
};