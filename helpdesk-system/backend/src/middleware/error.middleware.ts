// src/middleware/error.middleware.ts

import type {
    Request,
    Response,
    NextFunction,
} from "express";

export const notFound = (
    req: Request,
    res: Response
) => {
    return res.status(404).json({
        success: false,
        message: "Route not found",
    });
};

export const errorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};