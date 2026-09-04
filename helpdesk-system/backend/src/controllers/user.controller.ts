import type { Request, Response, NextFunction } from "express";

import {
    createUserByAdmin,
    getAllUsers,
    getUserById,
    updateUser,
    activateUser,
    deactivateUser,
} from "../services/user.service.js";

type UserRole =
    | "EMPLOYEE"
    | "TECHNICIAN"
    | "ADMIN";

const validRoles: UserRole[] = [
    "EMPLOYEE",
    "TECHNICIAN",
    "ADMIN",
];

/* =========================================================
   ERROR HANDLER
   ========================================================= */

const handleUserServiceError = (
    error: unknown,
    res: Response
) => {
    if (!(error instanceof Error)) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

    const errorMap: Record<
        string,
        {
            status: number;
            message: string;
        }
    > = {
        USER_NOT_FOUND: {
            status: 404,
            message: "User not found",
        },

        EMAIL_ALREADY_EXISTS: {
            status: 409,
            message: "Email already exists",
        },

        EMPLOYEE_NUMBER_EXISTS: {
            status: 409,
            message: "Employee number already exists",
        },

        INVALID_FULL_NAME: {
            status: 400,
            message: "Invalid full name",
        },

        INVALID_EMAIL: {
            status: 400,
            message: "Invalid email",
        },

        INVALID_EMPLOYEE_NUMBER: {
            status: 400,
            message: "Invalid employee number",
        },

        PASSWORD_TOO_SHORT: {
            status: 400,
            message:
                "Password must be at least 8 characters",
        },

        ORGANIZATION_NOT_FOUND: {
            status: 404,
            message: "Organization not found",
        },

        ORGANIZATION_INACTIVE: {
            status: 400,
            message: "Organization is inactive",
        },

        BRANCH_NOT_FOUND: {
            status: 404,
            message: "Branch not found",
        },

        BRANCH_INACTIVE: {
            status: 400,
            message: "Branch is inactive",
        },

        BRANCH_ORGANIZATION_MISMATCH: {
            status: 400,
            message:
                "Branch does not belong to the selected organization",
        },

        LOCATION_NOT_FOUND: {
            status: 404,
            message: "Location not found",
        },

        LOCATION_INACTIVE: {
            status: 400,
            message: "Location is inactive",
        },

        LOCATION_BRANCH_MISMATCH: {
            status: 400,
            message:
                "Location does not belong to the selected branch",
        },

        LOCATION_ORGANIZATION_MISMATCH: {
            status: 400,
            message:
                "Location does not belong to the selected organization",
        },

        DEPARTMENT_NOT_FOUND: {
            status: 404,
            message: "Department not found",
        },

        DEPARTMENT_ORGANIZATION_MISMATCH: {
            status: 400,
            message:
                "Department does not belong to the selected organization",
        },

        DEPARTMENT_BRANCH_MISMATCH: {
            status: 400,
            message:
                "Department does not belong to the selected branch",
        },

        TEAM_NOT_FOUND: {
            status: 404,
            message: "Team not found",
        },

        TEAM_ORGANIZATION_MISMATCH: {
            status: 400,
            message:
                "Team does not belong to the selected organization",
        },

        TEAM_BRANCH_MISMATCH: {
            status: 400,
            message:
                "Team does not belong to the selected branch",
        },

        TEAM_DEPARTMENT_MISMATCH: {
            status: 400,
            message:
                "Team does not belong to the selected department",
        },

        MANAGER_NOT_FOUND: {
            status: 404,
            message: "Manager not found",
        },

        MANAGER_INACTIVE: {
            status: 400,
            message: "Manager account is inactive",
        },

        MANAGER_ORGANIZATION_MISMATCH: {
            status: 400,
            message:
                "Manager does not belong to the selected organization",
        },

        USER_CANNOT_MANAGE_SELF: {
            status: 400,
            message:
                "A user cannot be assigned as their own manager",
        },

        USER_ALREADY_ACTIVE: {
            status: 409,
            message: "User is already active",
        },

        USER_ALREADY_INACTIVE: {
            status: 409,
            message: "User is already inactive",
        },
    };

    const mapped =
        errorMap[error.message];

    if (mapped) {
        return res
            .status(mapped.status)
            .json({
                success: false,
                message: mapped.message,
            });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};

/* =========================================================
   CREATE USER BY ADMIN
   ========================================================= */

export const createUser = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            fullName,
            email,
            password,
            role,
            employeeNumber,
            jobTitle,
            organizationId,
            branchId,
            locationId,
            departmentId,
            teamId,
            managerId,
        } = req.body;

        if (
            typeof fullName !== "string" ||
            !fullName.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, email and password are required",
            });
        }

        if (
            role !== undefined &&
            !validRoles.includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role",
            });
        }

        const createData: {
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
        } = {
            fullName,
            email,
            password,
        };

        if (role !== undefined) {
            createData.role = role;
        }

        if (
            employeeNumber !== undefined
        ) {
            if (
                typeof employeeNumber !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Employee number must be a string",
                });
            }

            createData.employeeNumber =
                employeeNumber;
        }

        if (jobTitle !== undefined) {
            if (
                typeof jobTitle !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Job title must be a string",
                });
            }

            createData.jobTitle =
                jobTitle;
        }

        const idFields = [
            ["organizationId", organizationId],
            ["branchId", branchId],
            ["locationId", locationId],
            ["departmentId", departmentId],
            ["teamId", teamId],
            ["managerId", managerId],
        ] as const;

        for (const [fieldName, value] of idFields) {
            if (
                value !== undefined &&
                value !== null
            ) {
                const parsed = Number(value);

                if (
                    Number.isNaN(parsed) ||
                    parsed <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid ${fieldName}`,
                    });
                }

                createData[fieldName] =
                    parsed;
            }
        }

        const user =
            await createUserByAdmin(
                createData
            );

        return res.status(201).json({
            success: true,
            message:
                "User created successfully",
            data: {
                user,
            },
        });
    } catch (error) {
        return handleUserServiceError(
            error,
            res
        );
    }
};

/* =========================================================
   GET USERS
   ========================================================= */

export const getUsers = async (
    req: Request,
    res: Response
) => {
    try {
        const filters: {
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
        } = {};

        if (req.query.page !== undefined) {
            const page =
                Number(req.query.page);

            if (
                Number.isNaN(page) ||
                page < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid page",
                });
            }

            filters.page = page;
        }

        if (
            req.query.limit !== undefined
        ) {
            const limit =
                Number(req.query.limit);

            if (
                Number.isNaN(limit) ||
                limit < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid limit",
                });
            }

            filters.limit = limit;
        }

        if (
            typeof req.query.search ===
            "string"
        ) {
            filters.search =
                req.query.search;
        }

        if (
            req.query.role !== undefined
        ) {
            const role =
                String(req.query.role) as UserRole;

            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role",
                });
            }

            filters.role = role;
        }

        if (
            req.query.isActive !== undefined
        ) {
            const isActive =
                String(req.query.isActive);

            if (
                isActive !== "true" &&
                isActive !== "false"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "isActive must be true or false",
                });
            }

            filters.isActive =
                isActive === "true";
        }

        const numericFilters = [
            [
                "organizationId",
                req.query.organizationId,
            ],
            [
                "branchId",
                req.query.branchId,
            ],
            [
                "locationId",
                req.query.locationId,
            ],
            [
                "departmentId",
                req.query.departmentId,
            ],
            [
                "teamId",
                req.query.teamId,
            ],
        ] as const;

        for (
            const [
                fieldName,
                value,
            ] of numericFilters
        ) {
            if (value !== undefined) {
                const parsed =
                    Number(value);

                if (
                    Number.isNaN(parsed) ||
                    parsed <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            `Invalid ${fieldName}`,
                    });
                }

                filters[fieldName] =
                    parsed;
            }
        }

        const result =
            await getAllUsers(
                filters
            );

        return res.status(200).json({
            success: true,

            data: {
                users: result.users,
                pagination:
                    result.pagination,
            },
        });
    } catch (error) {
        return handleUserServiceError(
            error,
            res
        );
    }
};

/* =========================================================
   GET USER BY ID
   ========================================================= */

export const getUser = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            Number(req.params.id);

        if (
            Number.isNaN(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const user =
            await getUserById(id);

        return res.status(200).json({
            success: true,

            data: {
                user,
            },
        });
    } catch (error) {
        return handleUserServiceError(
            error,
            res
        );
    }
};

/* =========================================================
   UPDATE USER
   ========================================================= */

export const patchUser = async (
    req: Request,
    res: Response
) => {
    try {
        const id =
            Number(req.params.id);

        if (
            Number.isNaN(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const {
            fullName,
            email,
            role,
            isActive,

            employeeNumber,
            jobTitle,

            organizationId,
            branchId,
            locationId,
            departmentId,
            teamId,
            managerId,
        } = req.body;

        if (
            role !== undefined &&
            !validRoles.includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role",
            });
        }

        if (
            isActive !== undefined &&
            typeof isActive !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "isActive must be boolean",
            });
        }

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

        if (fullName !== undefined) {
            if (
                typeof fullName !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Full name must be a string",
                });
            }

            updateData.fullName =
                fullName;
        }

        if (email !== undefined) {
            if (
                typeof email !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email must be a string",
                });
            }

            updateData.email =
                email;
        }

        if (role !== undefined) {
            updateData.role = role;
        }

        if (isActive !== undefined) {
            updateData.isActive =
                isActive;
        }

        if (
            employeeNumber !== undefined
        ) {
            if (
                employeeNumber !== null &&
                typeof employeeNumber !==
                "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Employee number must be a string or null",
                });
            }

            updateData.employeeNumber =
                employeeNumber;
        }

        if (jobTitle !== undefined) {
            if (
                jobTitle !== null &&
                typeof jobTitle !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Job title must be a string or null",
                });
            }

            updateData.jobTitle =
                jobTitle;
        }

        const relationshipFields = [
            [
                "organizationId",
                organizationId,
            ],
            ["branchId", branchId],
            ["locationId", locationId],
            [
                "departmentId",
                departmentId,
            ],
            ["teamId", teamId],
            ["managerId", managerId],
        ] as const;

        for (
            const [
                fieldName,
                value,
            ] of relationshipFields
        ) {
            if (value !== undefined) {
                if (value === null) {
                    updateData[fieldName] =
                        null;

                    continue;
                }

                const parsed =
                    Number(value);

                if (
                    Number.isNaN(parsed) ||
                    parsed <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            `Invalid ${fieldName}`,
                    });
                }

                updateData[fieldName] =
                    parsed;
            }
        }

        const user =
            await updateUser(
                id,
                updateData
            );

        return res.status(200).json({
            success: true,
            message:
                "User updated successfully",

            data: {
                user,
            },
        });
    } catch (error) {
        return handleUserServiceError(
            error,
            res
        );
    }
};

/* =========================================================
   ACTIVATE USER
   ========================================================= */

export const activateUserController =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const id =
                Number(req.params.id);

            if (
                Number.isNaN(id) ||
                id <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user id",
                });
            }

            const user =
                await activateUser(id);

            return res.status(200).json({
                success: true,
                message:
                    "User activated successfully",

                data: {
                    user,
                },
            });
        } catch (error) {
            return handleUserServiceError(
                error,
                res
            );
        }
    };

/* =========================================================
   DEACTIVATE USER
   ========================================================= */

export const deactivateUserController =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const id =
                Number(req.params.id);

            if (
                Number.isNaN(id) ||
                id <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user id",
                });
            }

            const user =
                await deactivateUser(id);

            return res.status(200).json({
                success: true,
                message:
                    "User deactivated successfully",

                data: {
                    user,
                },
            });
        } catch (error) {
            return handleUserServiceError(
                error,
                res
            );
        }
    };