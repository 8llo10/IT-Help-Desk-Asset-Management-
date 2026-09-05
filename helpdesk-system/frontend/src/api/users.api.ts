import api from "./client";

export const getUsers = () => {
    return api.get("/users");
};

export const getUser = (
    userId: number
) => {
    return api.get(
        `/users/${userId}`
    );
};

export const updateUser = (
    userId: number,
    data: unknown
) => {
    return api.patch(
        `/users/${userId}`,
        data
    );
};