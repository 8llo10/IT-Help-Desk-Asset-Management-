import api from "./client";

export const getDepartments = () => {
    return api.get(
        "/departments"
    );
};

export const createDepartment = (
    data: unknown
) => {
    return api.post(
        "/departments",
        data
    );
};

export const updateDepartment = (
    departmentId: number,
    data: unknown
) => {
    return api.patch(
        `/departments/${departmentId}`,
        data
    );
};