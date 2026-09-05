import api from "./client";

export interface LoginPayload {
    email: string;
    password: string;
}

export const loginRequest = (
    data: LoginPayload
) => {
    return api.post(
        "/auth/login",
        data
    );
};

export const getMe = () => {
    return api.get("/auth/me");
};