import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

interface RegisterInput {
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
}

interface LoginInput {
    email: string;
    password: string;
}

/* =========================================================
   REGISTER
   ========================================================= */

export const registerUser = async (
    data: RegisterInput
) => {
    const normalizedEmail =
        data.email.trim().toLowerCase();

    const normalizedName =
        data.fullName.trim();

    if (!normalizedName) {
        throw new Error(
            "INVALID_FULL_NAME"
        );
    }

    if (!normalizedEmail) {
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

    const existingUser =
        await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

    if (existingUser) {
        throw new Error(
            "EMAIL_ALREADY_EXISTS"
        );
    }

    /* =======================================================
       EMPLOYEE NUMBER
       ======================================================= */

    if (
        data.employeeNumber !== undefined
    ) {
        const employeeNumber =
            data.employeeNumber
                .trim()
                .toUpperCase();

        if (!employeeNumber) {
            throw new Error(
                "INVALID_EMPLOYEE_NUMBER"
            );
        }

        const existingEmployeeNumber =
            await prisma.user.findUnique({
                where: {
                    employeeNumber,
                },
            });

        if (existingEmployeeNumber) {
            throw new Error(
                "EMPLOYEE_NUMBER_EXISTS"
            );
        }
    }

    /* =======================================================
       ORGANIZATION
       ======================================================= */

    let organizationId:
        | number
        | undefined;

    if (
        data.organizationId !== undefined
    ) {
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

        if (
            organization.status !== "ACTIVE"
        ) {
            throw new Error(
                "ORGANIZATION_INACTIVE"
            );
        }

        organizationId =
            organization.id;
    }

    /* =======================================================
       BRANCH
       ======================================================= */

    let branchId:
        | number
        | undefined;

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

        /*
          إذا المستخدم أرسل branchId
          ولم يرسل organizationId،
          نستنتج الشركة من الفرع.
        */
        if (
            organizationId === undefined
        ) {
            organizationId =
                branch.organizationId;
        }

        branchId = branch.id;
    }

    /* =======================================================
       LOCATION
       ======================================================= */

    let locationId:
        | number
        | undefined;

    if (
        data.locationId !== undefined
    ) {
        const location =
            await prisma.location.findUnique({
                where: {
                    id: data.locationId,
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
            location.branchId !== branchId
        ) {
            throw new Error(
                "LOCATION_BRANCH_MISMATCH"
            );
        }

        if (
            organizationId !== undefined &&
            location.branch.organizationId !==
            organizationId
        ) {
            throw new Error(
                "LOCATION_ORGANIZATION_MISMATCH"
            );
        }

        /*
          إذا لم يُرسل branchId،
          نستنتجه من الـLocation.
        */
        if (branchId === undefined) {
            branchId =
                location.branchId;
        }

        /*
          وإذا لم تُحدد الشركة،
          نستنتجها من فرع الـLocation.
        */
        if (
            organizationId === undefined
        ) {
            organizationId =
                location.branch.organizationId;
        }

        locationId = location.id;
    }

    /* =======================================================
       DEPARTMENT
       ======================================================= */

    let departmentId:
        | number
        | undefined;

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
            organizationId !== undefined &&
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
            department.branchId !== null &&
            department.branchId !==
            branchId
        ) {
            throw new Error(
                "DEPARTMENT_BRANCH_MISMATCH"
            );
        }

        /*
          لو Department قديم ولسه organizationId
          عنده null، ما نفرض شيء.
    
          لكن لو عنده organizationId
          والمستخدم ما أرسل Organization،
          نستخدمه.
        */
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

        departmentId =
            department.id;
    }

    /* =======================================================
       TEAM
       ======================================================= */

    let teamId:
        | number
        | undefined;

    if (data.teamId !== undefined) {
        const team =
            await prisma.team.findUnique({
                where: {
                    id: data.teamId,
                },
            });

        if (!team) {
            throw new Error(
                "TEAM_NOT_FOUND"
            );
        }

        if (
            organizationId !== undefined &&
            team.organizationId !==
            organizationId
        ) {
            throw new Error(
                "TEAM_ORGANIZATION_MISMATCH"
            );
        }

        if (
            branchId !== undefined &&
            team.branchId !== null &&
            team.branchId !== branchId
        ) {
            throw new Error(
                "TEAM_BRANCH_MISMATCH"
            );
        }

        if (
            departmentId !== undefined &&
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

        teamId = team.id;
    }

    /* =======================================================
       PASSWORD HASH
       ======================================================= */

    const passwordHash =
        await bcrypt.hash(
            data.password,
            12
        );

    /* =======================================================
       CREATE DATA
       ======================================================= */

    const createData: {
        fullName: string;
        email: string;
        passwordHash: string;

        employeeNumber?: string;
        jobTitle?: string;

        organizationId?: number;
        branchId?: number;
        locationId?: number;
        departmentId?: number;
        teamId?: number;
    } = {
        fullName: normalizedName,
        email: normalizedEmail,
        passwordHash,
    };

    if (
        data.employeeNumber !== undefined
    ) {
        createData.employeeNumber =
            data.employeeNumber
                .trim()
                .toUpperCase();
    }

    if (
        data.jobTitle !== undefined &&
        data.jobTitle.trim()
    ) {
        createData.jobTitle =
            data.jobTitle.trim();
    }

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

    if (locationId !== undefined) {
        createData.locationId =
            locationId;
    }

    if (
        departmentId !== undefined
    ) {
        createData.departmentId =
            departmentId;
    }

    if (teamId !== undefined) {
        createData.teamId =
            teamId;
    }

    /*
      مهم جدًا:
      ما نرسل role هنا.
      Prisma سيستخدم default:
      EMPLOYEE
    */

    const user =
        await prisma.user.create({
            data: createData,

            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isActive: true,

                employeeNumber: true,
                jobTitle: true,

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

                createdAt: true,
            },
        });

    return user;
};

/* =========================================================
   LOGIN
   ========================================================= */

export const loginUser = async ({
    email,
    password,
}: LoginInput) => {
    const normalizedEmail =
        email.trim().toLowerCase();

    const user =
        await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
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
                    },
                },
            },
        });

    if (!user) {
        throw new Error(
            "INVALID_CREDENTIALS"
        );
    }

    const passwordMatches =
        await bcrypt.compare(
            password,
            user.passwordHash
        );

    if (!passwordMatches) {
        throw new Error(
            "INVALID_CREDENTIALS"
        );
    }

    if (!user.isActive) {
        throw new Error(
            "USER_INACTIVE"
        );
    }

    /*
      إذا المستخدم تابع لشركة موقوفة،
      نوقف الدخول.
    */
    if (
        user.organization &&
        user.organization.status !==
        "ACTIVE"
    ) {
        throw new Error(
            "ORGANIZATION_INACTIVE"
        );
    }

    if (
        user.branch &&
        user.branch.status !== "ACTIVE"
    ) {
        throw new Error(
            "BRANCH_INACTIVE"
        );
    }

    if (
        user.location &&
        user.location.status !== "ACTIVE"
    ) {
        throw new Error(
            "LOCATION_INACTIVE"
        );
    }

    const jwtSecret =
        process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error(
            "JWT_SECRET_NOT_DEFINED"
        );
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,

            organizationId:
                user.organizationId,

            branchId:
                user.branchId,
        },

        jwtSecret,

        {
            expiresIn: "1d",
        }
    );

    return {
        token,

        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,

            employeeNumber:
                user.employeeNumber,

            jobTitle:
                user.jobTitle,

            role: user.role,
            isActive: user.isActive,

            organization:
                user.organization,

            branch:
                user.branch,

            location:
                user.location,

            department:
                user.department,

            team:
                user.team,

            manager:
                user.manager,
        },
    };
};