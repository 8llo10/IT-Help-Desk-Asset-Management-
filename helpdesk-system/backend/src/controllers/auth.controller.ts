import type { Request, Response } from "express";

import {
    registerUser,
    loginUser,
} from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const user = await registerUser({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "EMAIL_ALREADY_EXISTS"
        ) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const result = await loginUser({
            email: email.trim().toLowerCase(),
            password,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_CREDENTIALS"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (
            error instanceof Error &&
            error.message === "USER_INACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};