import {
    createContext,
    useCallback,
    useEffect,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import api from "../api/client";

export type UserRole =
    | "ADMIN"
    | "TECHNICIAN"
    | "EMPLOYEE";

export interface AuthUser {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;

    login: (
        token: string,
        user: AuthUser
    ) => void;

    logout: () => void;

    refreshUser:
    () => Promise<void>;
}

export const AuthContext =
    createContext<
        AuthContextType | undefined
    >(undefined);

interface Props {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: Props) {
    const [
        token,
        setToken,
    ] =
        useState<string | null>(() =>
            localStorage.getItem(
                "token"
            )
        );

    const [
        user,
        setUser,
    ] =
        useState<AuthUser | null>(
            () => {
                const storedUser =
                    localStorage.getItem(
                        "user"
                    );

                if (!storedUser) {
                    return null;
                }

                try {
                    return JSON.parse(
                        storedUser
                    );
                } catch {
                    localStorage.removeItem(
                        "user"
                    );

                    return null;
                }
            }
        );

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const login = (
        newToken: string,
        newUser: AuthUser
    ) => {
        localStorage.setItem(
            "token",
            newToken
        );

        localStorage.setItem(
            "user",
            JSON.stringify(
                newUser
            )
        );

        setToken(
            newToken
        );

        setUser(
            newUser
        );
    };

    const logout =
        useCallback(() => {
            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            setToken(
                null
            );

            setUser(
                null
            );
        }, []);

    const refreshUser =
        useCallback(
            async () => {
                const storedToken =
                    localStorage.getItem(
                        "token"
                    );

                if (!storedToken) {
                    setToken(null);
                    setUser(null);

                    return;
                }

                try {
                    const response =
                        await api.get(
                            "/auth/me"
                        );

                    const currentUser =
                        response.data?.data
                            ?.user ??
                        response.data?.data ??
                        response.data?.user;

                    if (
                        !currentUser
                    ) {
                        logout();
                        return;
                    }

                    setUser(
                        currentUser
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            currentUser
                        )
                    );
                } catch {
                    logout();
                }
            },
            [logout]
        );

    useEffect(() => {
        const initializeAuth =
            async () => {
                try {
                    if (token) {
                        await refreshUser();
                    }
                } finally {
                    setLoading(
                        false
                    );
                }
            };

        void initializeAuth();
    }, [
        token,
        refreshUser,
    ]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}