import type { Request, Response } from "express";

import {
    registerUser,
    loginUser,
} from "../services/auth.service.js";

/* =========================================================
   REGISTER
   ========================================================= */

export const register = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            fullName,
            email,
            password,

            employeeNumber,
            jobTitle,

            organizationId,
            branchId,
            locationId,
            departmentId,
            teamId,
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

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters",
            });
        }

        const registerData: {
            fullName: string;
            email: string;
            password: string;

            employeeNumber?: string;
            jobTitle?: string;

            organizationId?: number;
            branchId?: number;
            locationId?: number;
            departmentId?: number;
            teamId?: number;
        } = {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
        };

        /* =====================================================
           OPTIONAL TEXT FIELDS
           ===================================================== */

        if (
            employeeNumber !== undefined &&
            employeeNumber !== null
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

            registerData.employeeNumber =
                employeeNumber;
        }

        if (
            jobTitle !== undefined &&
            jobTitle !== null
        ) {
            if (
                typeof jobTitle !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Job title must be a string",
                });
            }

            registerData.jobTitle =
                jobTitle;
        }

        /* =====================================================
           OPTIONAL RELATION IDS
           ===================================================== */

        if (
            organizationId !== undefined &&
            organizationId !== null
        ) {
            const parsedOrganizationId =
                Number(organizationId);

            if (
                Number.isNaN(
                    parsedOrganizationId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid organization id",
                });
            }

            registerData.organizationId =
                parsedOrganizationId;
        }

        if (
            branchId !== undefined &&
            branchId !== null
        ) {
            const parsedBranchId =
                Number(branchId);

            if (
                Number.isNaN(parsedBranchId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid branch id",
                });
            }

            registerData.branchId =
                parsedBranchId;
        }

        if (
            locationId !== undefined &&
            locationId !== null
        ) {
            const parsedLocationId =
                Number(locationId);

            if (
                Number.isNaN(parsedLocationId)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid location id",
                });
            }

            registerData.locationId =
                parsedLocationId;
        }

        if (
            departmentId !== undefined &&
            departmentId !== null
        ) {
            const parsedDepartmentId =
                Number(departmentId);

            if (
                Number.isNaN(
                    parsedDepartmentId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid department id",
                });
            }

            registerData.departmentId =
                parsedDepartmentId;
        }

        if (
            teamId !== undefined &&
            teamId !== null
        ) {
            const parsedTeamId =
                Number(teamId);

            if (
                Number.isNaN(parsedTeamId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid team id",
                });
            }

            registerData.teamId =
                parsedTeamId;
        }

        const user =
            await registerUser(
                registerData
            );

        return res.status(201).json({
            success: true,
            message:
                "User registered successfully",

            data: {
                user,
            },
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(500).json({
                success: false,
                message:
                    "Internal server error",
            });
        }

        /* =====================================================
           DUPLICATES
           ===================================================== */

        if (
            error.message ===
            "EMAIL_ALREADY_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Email already exists",
            });
        }

        if (
            error.message ===
            "EMPLOYEE_NUMBER_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Employee number already exists",
            });
        }

        /* =====================================================
           VALIDATION
           ===================================================== */

        if (
            error.message ===
            "INVALID_FULL_NAME"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid full name",
            });
        }

        if (
            error.message ===
            "INVALID_EMAIL"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid email",
            });
        }

        if (
            error.message ===
            "PASSWORD_TOO_SHORT"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters",
            });
        }

        if (
            error.message ===
            "INVALID_EMPLOYEE_NUMBER"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid employee number",
            });
        }

        /* =====================================================
           ORGANIZATION
           ===================================================== */

        if (
            error.message ===
            "ORGANIZATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Organization not found",
            });
        }

        if (
            error.message ===
            "ORGANIZATION_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Organization is inactive",
            });
        }

        /* =====================================================
           BRANCH
           ===================================================== */

        if (
            error.message ===
            "BRANCH_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Branch not found",
            });
        }

        if (
            error.message ===
            "BRANCH_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Branch is inactive",
            });
        }

        if (
            error.message ===
            "BRANCH_ORGANIZATION_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Branch does not belong to the selected organization",
            });
        }

        /* =====================================================
           LOCATION
           ===================================================== */

        if (
            error.message ===
            "LOCATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Location not found",
            });
        }

        if (
            error.message ===
            "LOCATION_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Location is inactive",
            });
        }

        if (
            error.message ===
            "LOCATION_BRANCH_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Location does not belong to the selected branch",
            });
        }

        if (
            error.message ===
            "LOCATION_ORGANIZATION_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Location does not belong to the selected organization",
            });
        }

        /* =====================================================
           DEPARTMENT
           ===================================================== */

        if (
            error.message ===
            "DEPARTMENT_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Department not found",
            });
        }

        if (
            error.message ===
            "DEPARTMENT_ORGANIZATION_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Department does not belong to the selected organization",
            });
        }

        if (
            error.message ===
            "DEPARTMENT_BRANCH_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Department does not belong to the selected branch",
            });
        }

        /* =====================================================
           TEAM
           ===================================================== */

        if (
            error.message ===
            "TEAM_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Team not found",
            });
        }

        if (
            error.message ===
            "TEAM_ORGANIZATION_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Team does not belong to the selected organization",
            });
        }

        if (
            error.message ===
            "TEAM_BRANCH_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Team does not belong to the selected branch",
            });
        }

        if (
            error.message ===
            "TEAM_DEPARTMENT_MISMATCH"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Team does not belong to the selected department",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

/* =========================================================
   LOGIN
   ========================================================= */

export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        const result =
            await loginUser({
                email:
                    email
                        .trim()
                        .toLowerCase(),

                password,
            });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        if (!(error instanceof Error)) {
            return res.status(500).json({
                success: false,
                message:
                    "Internal server error",
            });
        }

        if (
            error.message ===
            "INVALID_CREDENTIALS"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        if (
            error.message ===
            "USER_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "User account is inactive",
            });
        }

        if (
            error.message ===
            "ORGANIZATION_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Your organization is currently inactive",
            });
        }

        if (
            error.message ===
            "BRANCH_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Your branch is currently inactive",
            });
        }

        if (
            error.message ===
            "LOCATION_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Your location is currently inactive",
            });
        }

        if (
            error.message ===
            "JWT_SECRET_NOT_DEFINED"
        ) {
            console.error(
                "JWT_SECRET is not configured"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Authentication service configuration error",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};