import prisma from "../config/prisma.js";

interface CreateTeamInput {
    name: string;
    type:
    | "SERVICE_DESK"
    | "INFRASTRUCTURE"
    | "APPLICATIONS"
    | "SECURITY"
    | "NETWORK"
    | "OTHER";

    organizationId: number;
    branchId?: number;
    departmentId?: number;
}

interface UpdateTeamInput {
    name?: string;

    type?:
    | "SERVICE_DESK"
    | "INFRASTRUCTURE"
    | "APPLICATIONS"
    | "SECURITY"
    | "NETWORK"
    | "OTHER";

    branchId?: number | null;
    departmentId?: number | null;
}

export const createTeam = async (
    data: CreateTeamInput
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

    if (data.branchId !== undefined) {
        const branch =
            await prisma.branch.findUnique({
                where: {
                    id: data.branchId,
                },
            });

        if (!branch) {
            throw new Error(
                "BRANCH_NOT_FOUND"
            );
        }

        if (
            branch.organizationId !==
            data.organizationId
        ) {
            throw new Error(
                "BRANCH_ORGANIZATION_MISMATCH"
            );
        }
    }

    if (
        data.departmentId !== undefined
    ) {
        const department =
            await prisma.department.findUnique({
                where: {
                    id: data.departmentId,
                },
            });

        if (!department) {
            throw new Error(
                "DEPARTMENT_NOT_FOUND"
            );
        }

        if (
            department.organizationId !== null &&
            department.organizationId !==
            data.organizationId
        ) {
            throw new Error(
                "DEPARTMENT_ORGANIZATION_MISMATCH"
            );
        }

        if (
            data.branchId !== undefined &&
            department.branchId !== null &&
            department.branchId !==
            data.branchId
        ) {
            throw new Error(
                "DEPARTMENT_BRANCH_MISMATCH"
            );
        }
    }

    const existingTeam =
        await prisma.team.findFirst({
            where: {
                organizationId:
                    data.organizationId,

                name: {
                    equals: data.name.trim(),
                    mode: "insensitive",
                },
            },
        });

    if (existingTeam) {
        throw new Error(
            "TEAM_ALREADY_EXISTS"
        );
    }

    const createData: {
        name: string;
        type:
        | "SERVICE_DESK"
        | "INFRASTRUCTURE"
        | "APPLICATIONS"
        | "SECURITY"
        | "NETWORK"
        | "OTHER";

        organizationId: number;

        branchId?: number;
        departmentId?: number;
    } = {
        name: data.name.trim(),
        type: data.type,
        organizationId:
            data.organizationId,
    };

    if (data.branchId !== undefined) {
        createData.branchId =
            data.branchId;
    }

    if (
        data.departmentId !== undefined
    ) {
        createData.departmentId =
            data.departmentId;
    }

    return prisma.team.create({
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

            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const getAllTeams = async (
    organizationId?: number
) => {
    if (
        organizationId !== undefined
    ) {
        return prisma.team.findMany({
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

                branch: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },

                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                _count: {
                    select: {
                        users: true,
                    },
                },
            },

            orderBy: {
                name: "asc",
            },
        });
    }

    return prisma.team.findMany({
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

            department: {
                select: {
                    id: true,
                    name: true,
                },
            },

            _count: {
                select: {
                    users: true,
                },
            },
        },

        orderBy: {
            name: "asc",
        },
    });
};

export const getTeamById = async (
    id: number
) => {
    const team =
        await prisma.team.findUnique({
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

                branch: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },

                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                users: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        jobTitle: true,
                        employeeNumber: true,
                        isActive: true,
                    },

                    orderBy: {
                        fullName: "asc",
                    },
                },

                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

    if (!team) {
        throw new Error(
            "TEAM_NOT_FOUND"
        );
    }

    return team;
};

export const updateTeam = async (
    id: number,
    data: UpdateTeamInput
) => {
    const team =
        await prisma.team.findUnique({
            where: {
                id,
            },
        });

    if (!team) {
        throw new Error(
            "TEAM_NOT_FOUND"
        );
    }

    if (
        data.name !== undefined &&
        !data.name.trim()
    ) {
        throw new Error(
            "INVALID_TEAM_NAME"
        );
    }

    if (
        data.branchId !== undefined &&
        data.branchId !== null
    ) {
        const branch =
            await prisma.branch.findUnique({
                where: {
                    id: data.branchId,
                },
            });

        if (!branch) {
            throw new Error(
                "BRANCH_NOT_FOUND"
            );
        }

        if (
            branch.organizationId !==
            team.organizationId
        ) {
            throw new Error(
                "BRANCH_ORGANIZATION_MISMATCH"
            );
        }
    }

    if (
        data.departmentId !== undefined &&
        data.departmentId !== null
    ) {
        const department =
            await prisma.department.findUnique({
                where: {
                    id: data.departmentId,
                },
            });

        if (!department) {
            throw new Error(
                "DEPARTMENT_NOT_FOUND"
            );
        }

        if (
            department.organizationId !== null &&
            department.organizationId !==
            team.organizationId
        ) {
            throw new Error(
                "DEPARTMENT_ORGANIZATION_MISMATCH"
            );
        }

        const targetBranchId =
            data.branchId !== undefined
                ? data.branchId
                : team.branchId;

        if (
            targetBranchId !== null &&
            department.branchId !== null &&
            department.branchId !==
            targetBranchId
        ) {
            throw new Error(
                "DEPARTMENT_BRANCH_MISMATCH"
            );
        }
    }

    if (data.name !== undefined) {
        const existingTeam =
            await prisma.team.findFirst({
                where: {
                    organizationId:
                        team.organizationId,

                    name: {
                        equals:
                            data.name.trim(),
                        mode: "insensitive",
                    },

                    NOT: {
                        id,
                    },
                },
            });

        if (existingTeam) {
            throw new Error(
                "TEAM_ALREADY_EXISTS"
            );
        }
    }

    const updateData: {
        name?: string;

        type?:
        | "SERVICE_DESK"
        | "INFRASTRUCTURE"
        | "APPLICATIONS"
        | "SECURITY"
        | "NETWORK"
        | "OTHER";

        branchId?: number | null;
        departmentId?: number | null;
    } = {};

    if (data.name !== undefined) {
        updateData.name =
            data.name.trim();
    }

    if (data.type !== undefined) {
        updateData.type =
            data.type;
    }

    if (
        data.branchId !== undefined
    ) {
        updateData.branchId =
            data.branchId;
    }

    if (
        data.departmentId !== undefined
    ) {
        updateData.departmentId =
            data.departmentId;
    }

    return prisma.team.update({
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

            department: {
                select: {
                    id: true,
                    name: true,
                },
            },

            _count: {
                select: {
                    users: true,
                },
            },
        },
    });
};