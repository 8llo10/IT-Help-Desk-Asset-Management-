import type { Request, Response } from "express";

import {
    createDepartment,
    getAllDepartments,
} from "../services/department.service.js";

export const create = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name is required",
            });
        }

        const department = await createDepartment(name.trim());

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: {
                department,
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

export const getAll = async (req: Request, res: Response) => {
    try {
        const departments = await getAllDepartments();

        return res.status(200).json({
            success: true,
            data: {
                departments,
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