import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import {
    createNotification,
} from "./notification.service.js";

type UserRole =
    | "EMPLOYEE"
    | "TECHNICIAN"
    | "ADMIN";

interface CreateUserByAdminInput {
    fullName: string;
    email: string;
    password: string;

    role?: UserRole;

    employeeNumber?: string;
    jobTitle?: string;

    organizationId?: number;
    branchId?: number;
    locationId?: number;
    departmentId?: number;
    teamId?: number;
    managerId?: number;
}

interface UpdateUserInput {
    fullName?: string;
    email?: string;

    role?: UserRole;
    isActive?: boolean;

    employeeNumber?: string | null;
    jobTitle?: string | null;

    organizationId?: number | null;
    branchId?: number | null;
    locationId?: number | null;
    departmentId?: number | null;
    teamId?: number | null;
    managerId?: number | null;
}

interface GetUsersFilters {
    page?: number;
    limit?: number;

    search?: string;
    role?: UserRole;
    isActive?: boolean;

    organizationId?: number;
    branchId?: number;
    locationId?: number;
    departmentId?: number;
    teamId?: number;
}

/* =========================================================
   HIERARCHY VALIDATION
   ========================================================= */

const validateHierarchy = async (
    data: {
        organizationId?: number | null;
        branchId?: number | null;
        locationId?: number | null;
        departmentId?: number | null;
        teamId?: number | null;
        managerId?: number | null;
    },
    currentUserId?: number
) => {
    let organizationId =
        data.organizationId;

    let branchId =
        data.branchId;

    let locationId =
        data.locationId;

    let departmentId =
        data.departmentId;

    let teamId =
        data.teamId;

    let managerId =
        data.managerId;

    /* =======================================================
       ORGANIZATION
       ======================================================= */

    if (
        organizationId !== undefined &&
        organizationId !== null
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

    if (
        branchId !== undefined &&
        branchId !== null
    ) {
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
            organizationId !== null &&
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
       LOCATION
       ======================================================= */

    if (
        locationId !== undefined &&
        locationId !== null
    ) {
        const location =
            await prisma.location.findUnique({
                where: {
                    id: locationId,
                },

                include: {
                    branch: true,
                },
            });

        if (!location) {
            throw new Error(
                "LOCATION_NOT_FOUND"
            );
        }

        if (
            location.status !== "ACTIVE"
        ) {
            throw new Error(
                "LOCATION_INACTIVE"
            );
        }

        if (
            branchId !== undefined &&
            branchId !== null &&
            location.branchId !== branchId
        ) {
            throw new Error(
                "LOCATION_BRANCH_MISMATCH"
            );
        }

        if (
            organizationId !== undefined &&
            organizationId !== null &&
            location.branch.organizationId !==
            organizationId
        ) {
            throw new Error(
                "LOCATION_ORGANIZATION_MISMATCH"
            );
        }

        if (
            branchId === undefined
        ) {
            branchId =
                location.branchId;
        }

        if (
            organizationId === undefined
        ) {
            organizationId =
                location.branch.organizationId;
        }
    }

    /* =======================================================
       DEPARTMENT
       ======================================================= */

    if (
        departmentId !== undefined &&
        departmentId !== null
    ) {
        const department =
            await prisma.department.findUnique({
                where: {
                    id: departmentId,
                },
            });

        if (!department) {
            throw new Error(
                "DEPARTMENT_NOT_FOUND"
            );
        }

        if (
            organizationId !== undefined &&
            organizationId !== null &&
            department.organizationId !== null &&
            department.organizationId !==
            organizationId
        ) {
            throw new Error(
                "DEPARTMENT_ORGANIZATION_MISMATCH"
            );
        }

        if (
            branchId !== undefined &&
            branchId !== null &&
            department.branchId !== null &&
            department.branchId !== branchId
        ) {
            throw new Error(
                "DEPARTMENT_BRANCH_MISMATCH"
            );
        }

        if (
            organizationId === undefined &&
            department.organizationId !== null
        ) {
            organizationId =
                department.organizationId;
        }

        if (
            branchId === undefined &&
            department.branchId !== null
        ) {
            branchId =
                department.branchId;
        }
    }

    /* =======================================================
       TEAM
       ======================================================= */

    if (
        teamId !== undefined &&
        teamId !== null
    ) {
        const team =
            await prisma.team.findUnique({
                where: {
                    id: teamId,
                },
            });

        if (!team) {
            throw new Error(
                "TEAM_NOT_FOUND"
            );
        }

        if (
            organizationId !== undefined &&
            organizationId !== null &&
            team.organizationId !==
            organizationId
        ) {
            throw new Error(
                "TEAM_ORGANIZATION_MISMATCH"
            );
        }

        if (
            branchId !== undefined &&
            branchId !== null &&
            team.branchId !== null &&
            team.branchId !== branchId
        ) {
            throw new Error(
                "TEAM_BRANCH_MISMATCH"
            );
        }

        if (
            departmentId !== undefined &&
            departmentId !== null &&
            team.departmentId !== null &&
            team.departmentId !==
            departmentId
        ) {
            throw new Error(
                "TEAM_DEPARTMENT_MISMATCH"
            );
        }

        if (
            organizationId === undefined
        ) {
            organizationId =
                team.organizationId;
        }

        if (
            branchId === undefined &&
            team.branchId !== null
        ) {
            branchId =
                team.branchId;
        }

        if (
            departmentId === undefined &&
            team.departmentId !== null
        ) {
            departmentId =
                team.departmentId;
        }
    }

    /* =======================================================
       MANAGER
       ======================================================= */

    if (
        managerId !== undefined &&
        managerId !== null
    ) {
        if (
            currentUserId !== undefined &&
            managerId === currentUserId
        ) {
            throw new Error(
                "USER_CANNOT_MANAGE_SELF"
            );
        }

        const manager =
            await prisma.user.findUnique({
                where: {
                    id: managerId,
                },
            });

        if (!manager) {
            throw new Error(
                "MANAGER_NOT_FOUND"
            );
        }

        if (!manager.isActive) {
            throw new Error(
                "MANAGER_INACTIVE"
            );
        }

        if (
            organizationId !== undefined &&
            organizationId !== null &&
            manager.organizationId !== null &&
            manager.organizationId !==
            organizationId
        ) {
            throw new Error(
                "MANAGER_ORGANIZATION_MISMATCH"
            );
        }
    }

    return {
        organizationId,
        branchId,
        locationId,
        departmentId,
        teamId,
        managerId,
    };
};

/* =========================================================
   ADMIN CREATE USER
   ========================================================= */

export const createUserByAdmin = async (
    data: CreateUserByAdminInput
) => {
    const fullName =
        data.fullName.trim();

    const email =
        data.email
            .trim()
            .toLowerCase();

    if (!fullName) {
        throw new Error(
            "INVALID_FULL_NAME"
        );
    }

    if (!email) {
        throw new Error(
            "INVALID_EMAIL"
        );
    }

    if (
        !data.password ||
        data.password.length < 8
    ) {
        throw new Error(
            "PASSWORD_TOO_SHORT"
        );
    }

    const existingEmail =
        await prisma.user.findUnique({
            where: {
                email,
            },
        });

    if (existingEmail) {
        throw new Error(
            "EMAIL_ALREADY_EXISTS"
        );
    }

    let normalizedEmployeeNumber:
        | string
        | undefined;

    if (
        data.employeeNumber !== undefined
    ) {
        normalizedEmployeeNumber =
            data.employeeNumber
                .trim()
                .toUpperCase();

        if (!normalizedEmployeeNumber) {
            throw new Error(
                "INVALID_EMPLOYEE_NUMBER"
            );
        }

        const existingEmployee =
            await prisma.user.findUnique({
                where: {
                    employeeNumber:
                        normalizedEmployeeNumber,
                },
            });

        if (existingEmployee) {
            throw new Error(
                "EMPLOYEE_NUMBER_EXISTS"
            );
        }
    }

    const hierarchyInput: {
        organizationId?: number | null;
        branchId?: number | null;
        locationId?: number | null;
        departmentId?: number | null;
        teamId?: number | null;
        managerId?: number | null;
    } = {};

    if (data.organizationId !== undefined) {
        hierarchyInput.organizationId =
            data.organizationId;
    }

    if (data.branchId !== undefined) {
        hierarchyInput.branchId =
            data.branchId;
    }

    if (data.locationId !== undefined) {
        hierarchyInput.locationId =
            data.locationId;
    }

    if (data.departmentId !== undefined) {
        hierarchyInput.departmentId =
            data.departmentId;
    }

    if (data.teamId !== undefined) {
        hierarchyInput.teamId =
            data.teamId;
    }

    if (data.managerId !== undefined) {
        hierarchyInput.managerId =
            data.managerId;
    }

    const hierarchy =
        await validateHierarchy(
            hierarchyInput
        );

    const passwordHash =
        await bcrypt.hash(
            data.password,
            12
        );

    const createData: {
        fullName: string;
        email: string;
        passwordHash: string;

        role?: UserRole;

        employeeNumber?: string;
        jobTitle?: string;

        organizationId?: number;
        branchId?: number;
        locationId?: number;
        departmentId?: number;
        teamId?: number;
        managerId?: number;
    } = {
        fullName,
        email,
        passwordHash,
    };

    if (data.role !== undefined) {
        createData.role =
            data.role;
    }

    if (
        normalizedEmployeeNumber !==
        undefined
    ) {
        createData.employeeNumber =
            normalizedEmployeeNumber;
    }

    if (
        data.jobTitle !== undefined &&
        data.jobTitle.trim()
    ) {
        createData.jobTitle =
            data.jobTitle.trim();
    }

    if (
        hierarchy.organizationId !==
        undefined &&
        hierarchy.organizationId !== null
    ) {
        createData.organizationId =
            hierarchy.organizationId;
    }

    if (
        hierarchy.branchId !== undefined &&
        hierarchy.branchId !== null
    ) {
        createData.branchId =
            hierarchy.branchId;
    }

    if (
        hierarchy.locationId !==
        undefined &&
        hierarchy.locationId !== null
    ) {
        createData.locationId =
            hierarchy.locationId;
    }

    if (
        hierarchy.departmentId !==
        undefined &&
        hierarchy.departmentId !== null
    ) {
        createData.departmentId =
            hierarchy.departmentId;
    }

    if (
        hierarchy.teamId !== undefined &&
        hierarchy.teamId !== null
    ) {
        createData.teamId =
            hierarchy.teamId;
    }

    if (
        hierarchy.managerId !== undefined &&
        hierarchy.managerId !== null
    ) {
        createData.managerId =
            hierarchy.managerId;
    }

    return prisma.user.create({
        data: createData,

        select: {
            id: true,
            fullName: true,
            email: true,

            employeeNumber: true,
            jobTitle: true,

            role: true,
            isActive: true,

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

            location: {
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

            team: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },

            manager: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },

            createdAt: true,
        },
    });
};

/* =========================================================
   GET ALL USERS
   ========================================================= */

export const getAllUsers = async (
    filters: GetUsersFilters = {}
) => {
    const page =
        filters.page &&
            filters.page > 0
            ? filters.page
            : 1;

    const limit =
        filters.limit &&
            filters.limit > 0
            ? Math.min(
                filters.limit,
                100
            )
            : 20;

    const skip =
        (page - 1) * limit;

    const where: any = {};

    if (
        filters.search !== undefined &&
        filters.search.trim()
    ) {
        const search =
            filters.search.trim();

        where.OR = [
            {
                fullName: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                employeeNumber: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                jobTitle: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (filters.role !== undefined) {
        where.role =
            filters.role;
    }

    if (
        filters.isActive !== undefined
    ) {
        where.isActive =
            filters.isActive;
    }

    if (
        filters.organizationId !== undefined
    ) {
        where.organizationId =
            filters.organizationId;
    }

    if (
        filters.branchId !== undefined
    ) {
        where.branchId =
            filters.branchId;
    }

    if (
        filters.locationId !== undefined
    ) {
        where.locationId =
            filters.locationId;
    }

    if (
        filters.departmentId !== undefined
    ) {
        where.departmentId =
            filters.departmentId;
    }

    if (
        filters.teamId !== undefined
    ) {
        where.teamId =
            filters.teamId;
    }

    const [users, total] =
        await prisma.$transaction([
            prisma.user.findMany({
                where,

                skip,
                take: limit,

                select: {
                    id: true,
                    fullName: true,
                    email: true,

                    employeeNumber: true,
                    jobTitle: true,

                    role: true,
                    isActive: true,

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

                    location: {
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

                    team: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },

                    manager: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },

                    createdAt: true,
                    updatedAt: true,
                },

                orderBy: {
                    createdAt: "desc",
                },
            }),

            prisma.user.count({
                where,
            }),
        ]);

    return {
        users,

        pagination: {
            page,
            limit,
            total,

            totalPages:
                Math.ceil(
                    total / limit
                ),
        },
    };
};

/* =========================================================
   GET USER BY ID
   ========================================================= */

export const getUserById = async (
    id: number
) => {
    const user =
        await prisma.user.findUnique({
            where: {
                id,
            },

            select: {
                id: true,
                fullName: true,
                email: true,

                employeeNumber: true,
                jobTitle: true,

                role: true,
                isActive: true,

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

                location: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        status: true,
                    },
                },

                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                team: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },

                manager: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        jobTitle: true,
                    },
                },

                directReports: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        jobTitle: true,
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
                },

                _count: {
                    select: {
                        createdTickets: true,
                        assignedTickets: true,
                        directReports: true,
                        assets: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
            },
        });

    if (!user) {
        throw new Error(
            "USER_NOT_FOUND"
        );
    }

    return user;
};

/* =========================================================
   UPDATE USER
   ========================================================= */

export const updateUser = async (
    id: number,
    data: UpdateUserInput
) => {
    const existingUser =
        await prisma.user.findUnique({
            where: {
                id,
            },
        });

    if (!existingUser) {
        throw new Error(
            "USER_NOT_FOUND"
        );
    }

    /* =======================================================
       FULL NAME
       ======================================================= */

    if (
        data.fullName !== undefined &&
        !data.fullName.trim()
    ) {
        throw new Error(
            "INVALID_FULL_NAME"
        );
    }

    /* =======================================================
       EMAIL
       ======================================================= */

    if (data.email !== undefined) {
        const normalizedEmail =
            data.email
                .trim()
                .toLowerCase();

        if (!normalizedEmail) {
            throw new Error(
                "INVALID_EMAIL"
            );
        }

        if (
            normalizedEmail !==
            existingUser.email
        ) {
            const emailExists =
                await prisma.user.findUnique({
                    where: {
                        email: normalizedEmail,
                    },
                });

            if (emailExists) {
                throw new Error(
                    "EMAIL_ALREADY_EXISTS"
                );
            }
        }
    }

    /* =======================================================
       EMPLOYEE NUMBER
       ======================================================= */

    if (
        data.employeeNumber !== undefined &&
        data.employeeNumber !== null
    ) {
        const normalizedEmployeeNumber =
            data.employeeNumber
                .trim()
                .toUpperCase();

        if (!normalizedEmployeeNumber) {
            throw new Error(
                "INVALID_EMPLOYEE_NUMBER"
            );
        }

        if (
            normalizedEmployeeNumber !==
            existingUser.employeeNumber
        ) {
            const numberExists =
                await prisma.user.findUnique({
                    where: {
                        employeeNumber:
                            normalizedEmployeeNumber,
                    },
                });

            if (numberExists) {
                throw new Error(
                    "EMPLOYEE_NUMBER_EXISTS"
                );
            }
        }
    }

    /* =======================================================
       RESOLVE TARGET ORGANIZATION STRUCTURE
       ======================================================= */

    const targetOrganizationId =
        data.organizationId !== undefined
            ? data.organizationId
            : existingUser.organizationId;

    const targetBranchId =
        data.branchId !== undefined
            ? data.branchId
            : existingUser.branchId;

    const targetLocationId =
        data.locationId !== undefined
            ? data.locationId
            : existingUser.locationId;

    const targetDepartmentId =
        data.departmentId !== undefined
            ? data.departmentId
            : existingUser.departmentId;

    const targetTeamId =
        data.teamId !== undefined
            ? data.teamId
            : existingUser.teamId;

    const targetManagerId =
        data.managerId !== undefined
            ? data.managerId
            : existingUser.managerId;

    await validateHierarchy(
        {
            organizationId:
                targetOrganizationId,

            branchId:
                targetBranchId,

            locationId:
                targetLocationId,

            departmentId:
                targetDepartmentId,

            teamId:
                targetTeamId,

            managerId:
                targetManagerId,
        },

        id
    );

    /* =======================================================
       UPDATE DATA
       ======================================================= */

    const updateData: {
        fullName?: string;
        email?: string;

        role?: UserRole;
        isActive?: boolean;

        employeeNumber?: string | null;
        jobTitle?: string | null;

        organizationId?: number | null;
        branchId?: number | null;
        locationId?: number | null;
        departmentId?: number | null;
        teamId?: number | null;
        managerId?: number | null;
    } = {};

    if (
        data.fullName !== undefined
    ) {
        updateData.fullName =
            data.fullName.trim();
    }

    if (data.email !== undefined) {
        updateData.email =
            data.email
                .trim()
                .toLowerCase();
    }

    if (data.role !== undefined) {
        updateData.role =
            data.role;
    }

    if (
        data.isActive !== undefined
    ) {
        updateData.isActive =
            data.isActive;
    }

    if (
        data.employeeNumber !== undefined
    ) {
        updateData.employeeNumber =
            data.employeeNumber === null
                ? null
                : data.employeeNumber
                    .trim()
                    .toUpperCase();
    }

    if (
        data.jobTitle !== undefined
    ) {
        updateData.jobTitle =
            data.jobTitle === null ||
                !data.jobTitle.trim()
                ? null
                : data.jobTitle.trim();
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

    if (
        data.locationId !== undefined
    ) {
        updateData.locationId =
            data.locationId;
    }

    if (
        data.departmentId !== undefined
    ) {
        updateData.departmentId =
            data.departmentId;
    }

    if (
        data.teamId !== undefined
    ) {
        updateData.teamId =
            data.teamId;
    }

    if (
        data.managerId !== undefined
    ) {
        updateData.managerId =
            data.managerId;
    }

    const updatedUser =
        await prisma.user.update({
            where: {
                id,
            },

            data: updateData,

            select: {
                id: true,
                fullName: true,
                email: true,

                employeeNumber: true,
                jobTitle: true,

                role: true,
                isActive: true,

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

                location: {
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

                team: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },

                manager: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },

                updatedAt: true,
            },
        });

    if (
        data.role !== undefined &&
        data.role !== existingUser.role
    ) {
        await createNotification({
            userId: id,
            type: "ROLE_CHANGED",
            title: "Account role changed",
            message:
                `Your account role has been changed from ${existingUser.role} to ${data.role}.`,
            entityType: "USER",
            entityId: id,
        });
    }

    if (
        data.isActive !== undefined &&
        data.isActive !== existingUser.isActive
    ) {
        if (data.isActive) {
            await createNotification({
                userId: id,
                type: "ACCOUNT_ACTIVATED",
                title: "Account activated",
                message:
                    "Your account has been activated successfully.",
                entityType: "USER",
                entityId: id,
            });
        } else {
            await createNotification({
                userId: id,
                type: "ACCOUNT_DEACTIVATED",
                title: "Account deactivated",
                message:
                    "Your account has been deactivated.",
                entityType: "USER",
                entityId: id,
            });
        }
    }

    return updatedUser;
};


/* =========================================================
   ACTIVATE USER
   ========================================================= */

export const activateUser = async (
    id: number
) => {
    const user =
        await prisma.user.findUnique({
            where: {
                id,
            },
        });

    if (!user) {
        throw new Error(
            "USER_NOT_FOUND"
        );
    }

    if (user.isActive) {
        throw new Error(
            "USER_ALREADY_ACTIVE"
        );
    }

    const updatedUser =
        await prisma.user.update({
            where: {
                id,
            },

            data: {
                isActive: true,
            },

            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });

    await createNotification({
        userId: id,
        type: "ACCOUNT_ACTIVATED",
        title: "Account activated",
        message:
            "Your account has been activated successfully.",
        entityType: "USER",
        entityId: id,
    });

    return updatedUser;
};

/* =========================================================
   DEACTIVATE USER
   ========================================================= */

export const deactivateUser = async (
    id: number
) => {
    const user =
        await prisma.user.findUnique({
            where: {
                id,
            },
        });

    if (!user) {
        throw new Error(
            "USER_NOT_FOUND"
        );
    }

    if (!user.isActive) {
        throw new Error(
            "USER_ALREADY_INACTIVE"
        );
    }

    const updatedUser =
        await prisma.user.update({
            where: {
                id,
            },

            data: {
                isActive: false,
            },

            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });

    await createNotification({
        userId: id,
        type: "ACCOUNT_DEACTIVATED",
        title: "Account deactivated",
        message:
            "Your account has been deactivated.",
        entityType: "USER",
        entityId: id,
    });

    return updatedUser;
};