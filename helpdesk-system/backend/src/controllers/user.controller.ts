// src/controllers/user.controller.ts

import type { Request, Response } from "express";
import {
    getAllUsers,
    updateUser,
} from "../services/user.service.js";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();

        return res.status(200).json({
            success: true,
            data: {
                users,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const patchUser = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const { role, isActive, departmentId } = req.body;

        const user = await updateUser(id, {
            role,
            isActive,
            departmentId,
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                user,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};