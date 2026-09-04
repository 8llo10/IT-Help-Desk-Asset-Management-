import type { Request, Response, NextFunction } from "express";

import {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
} from "../services/team.service.js";

export const createTeamController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            name,
            type,
            organizationId,
            branchId,
            departmentId,
        } = req.body;

        if (
            !name ||
            !type ||
            organizationId === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "name, type and organizationId are required",
            });
        }

        const team = await createTeam({
            name,
            type,
            organizationId: Number(organizationId),

            ...(branchId !== undefined &&
                branchId !== null && {
                branchId: Number(branchId),
            }),

            ...(departmentId !== undefined &&
                departmentId !== null && {
                departmentId: Number(departmentId),
            }),
        });

        return res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: team,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllTeamsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organizationId =
            req.query.organizationId !== undefined
                ? Number(req.query.organizationId)
                : undefined;

        if (
            organizationId !== undefined &&
            Number.isNaN(organizationId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid organizationId",
            });
        }

        const teams = await getAllTeams(
            organizationId
        );

        return res.status(200).json({
            success: true,
            count: teams.length,
            data: teams,
        });
    } catch (error) {
        next(error);
    }
};

export const getTeamByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid team id",
            });
        }

        const team = await getTeamById(id);

        return res.status(200).json({
            success: true,
            data: team,
        });
    } catch (error) {
        next(error);
    }
};

export const updateTeamController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid team id",
            });
        }

        const {
            name,
            type,
            branchId,
            departmentId,
        } = req.body;

        const team = await updateTeam(id, {
            ...(name !== undefined && {
                name,
            }),

            ...(type !== undefined && {
                type,
            }),

            ...(branchId !== undefined && {
                branchId:
                    branchId === null
                        ? null
                        : Number(branchId),
            }),

            ...(departmentId !== undefined && {
                departmentId:
                    departmentId === null
                        ? null
                        : Number(departmentId),
            }),
        });

        return res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: team,
        });
    } catch (error) {
        next(error);
    }
};