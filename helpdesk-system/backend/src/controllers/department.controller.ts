import type { Request, Response } from "express";

import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} from "../services/department.service.js";

/* =========================================================
   ERROR HANDLER
   ========================================================= */

const handleDepartmentError = (
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
    INVALID_DEPARTMENT_NAME: {
      status: 400,
      message: "Invalid department name",
    },

    DEPARTMENT_ALREADY_EXISTS: {
      status: 409,
      message:
        "Department already exists in this organization",
    },

    DEPARTMENT_NOT_FOUND: {
      status: 404,
      message: "Department not found",
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
   CREATE
   ========================================================= */

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      organizationId,
      branchId,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Department name is required",
      });
    }

    const createData: {
      name: string;
      organizationId?: number;
      branchId?: number;
    } = {
      name,
    };

    if (
      organizationId !== undefined &&
      organizationId !== null
    ) {
      const parsed =
        Number(organizationId);

      if (
        Number.isNaN(parsed) ||
        parsed <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid organization id",
        });
      }

      createData.organizationId =
        parsed;
    }

    if (
      branchId !== undefined &&
      branchId !== null
    ) {
      const parsed =
        Number(branchId);

      if (
        Number.isNaN(parsed) ||
        parsed <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid branch id",
        });
      }

      createData.branchId =
        parsed;
    }

    const department =
      await createDepartment(
        createData
      );

    return res.status(201).json({
      success: true,
      message:
        "Department created successfully",

      data: {
        department,
      },
    });
  } catch (error) {
    return handleDepartmentError(
      error,
      res
    );
  }
};

/* =========================================================
   GET ALL
   ========================================================= */

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    let organizationId:
      | number
      | undefined;

    let branchId:
      | number
      | undefined;

    if (
      req.query.organizationId !==
      undefined
    ) {
      const parsed =
        Number(
          req.query.organizationId
        );

      if (
        Number.isNaN(parsed) ||
        parsed <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid organization id",
        });
      }

      organizationId =
        parsed;
    }

    if (
      req.query.branchId !==
      undefined
    ) {
      const parsed =
        Number(
          req.query.branchId
        );

      if (
        Number.isNaN(parsed) ||
        parsed <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid branch id",
        });
      }

      branchId =
        parsed;
    }

    const departments =
      organizationId !== undefined &&
      branchId !== undefined
        ? await getAllDepartments(
            organizationId,
            branchId
          )
        : organizationId !== undefined
          ? await getAllDepartments(
              organizationId
            )
          : branchId !== undefined
            ? await getAllDepartments(
                undefined,
                branchId
              )
            : await getAllDepartments();

    return res.status(200).json({
      success: true,

      data: {
        departments,
      },
    });
  } catch (error) {
    return handleDepartmentError(
      error,
      res
    );
  }
};

/* =========================================================
   GET ONE
   ========================================================= */

export const getOne = async (
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
          "Invalid department id",
      });
    }

    const department =
      await getDepartmentById(id);

    return res.status(200).json({
      success: true,

      data: {
        department,
      },
    });
  } catch (error) {
    return handleDepartmentError(
      error,
      res
    );
  }
};

/* =========================================================
   UPDATE
   ========================================================= */

export const patch = async (
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
          "Invalid department id",
      });
    }

    const {
      name,
      organizationId,
      branchId,
    } = req.body;

    const updateData: {
      name?: string;
      organizationId?:
        | number
        | null;
      branchId?:
        | number
        | null;
    } = {};

    if (name !== undefined) {
      if (
        typeof name !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Department name must be a string",
        });
      }

      updateData.name =
        name;
    }

    if (
      organizationId !== undefined
    ) {
      if (
        organizationId === null
      ) {
        updateData.organizationId =
          null;
      } else {
        const parsed =
          Number(organizationId);

        if (
          Number.isNaN(parsed) ||
          parsed <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid organization id",
          });
        }

        updateData.organizationId =
          parsed;
      }
    }

    if (
      branchId !== undefined
    ) {
      if (branchId === null) {
        updateData.branchId =
          null;
      } else {
        const parsed =
          Number(branchId);

        if (
          Number.isNaN(parsed) ||
          parsed <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid branch id",
          });
        }

        updateData.branchId =
          parsed;
      }
    }

    const department =
      await updateDepartment(
        id,
        updateData
      );

    return res.status(200).json({
      success: true,
      message:
        "Department updated successfully",

      data: {
        department,
      },
    });
  } catch (error) {
    return handleDepartmentError(
      error,
      res
    );
  }
};