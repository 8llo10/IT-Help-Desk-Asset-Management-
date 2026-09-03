// src/controllers/category.controller.ts

import type { Request, Response } from "express";

import {
    createCategory,
    getAllCategories,
} from "../services/category.service.js";

export const create = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const category = await createCategory(name.trim());

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: {
                category,
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
        const categories = await getAllCategories();

        return res.status(200).json({
            success: true,
            data: {
                categories,
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