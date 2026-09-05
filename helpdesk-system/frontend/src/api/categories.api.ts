import api from "./client";

export const getCategories = () => {
    return api.get("/categories");
};

export const createCategory = (
    data: unknown
) => {
    return api.post(
        "/categories",
        data
    );
};

export const updateCategory = (
    categoryId: number,
    data: unknown
) => {
    return api.patch(
        `/categories/${categoryId}`,
        data
    );
};