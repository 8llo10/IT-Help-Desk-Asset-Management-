import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

interface RegisterInput {
    fullName: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export const registerUser = async ({
    fullName,
    email,
    password,
}: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            fullName,
            email,
            passwordHash,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    return user;
};

export const loginUser = async ({
    email,
    password,
}: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }

    if (!user.isActive) {
        throw new Error("USER_INACTIVE");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET_NOT_DEFINED");
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
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
            role: user.role,
            isActive: user.isActive,
        },
    };
};