import {
    Navigate,
} from "react-router-dom";

import type {
    ReactNode,
} from "react";

import useAuth from "../hooks/useAuth";

import type {
    UserRole,
} from "../context/AuthContext";

interface Props {
    children: ReactNode;
    allowedRoles: UserRole[];
}

export default function RoleRoute({
    children,
    allowedRoles,
}: Props) {
    const {
        user,
        loading,
    } = useAuth();

    if (loading) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        !allowedRoles.includes(
            user.role
        )
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return <>{children}</>;
}