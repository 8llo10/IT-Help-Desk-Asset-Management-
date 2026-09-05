import {
    Navigate,
    useLocation,
} from "react-router-dom";

import type {
    ReactNode,
} from "react";

import useAuth from "../hooks/useAuth";

interface Props {
    children: ReactNode;
}

export default function ProtectedRoute({
    children,
}: Props) {
    const {
        token,
        loading,
    } = useAuth();

    const location =
        useLocation();

    if (loading) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname +
                        location.search,
                }}
            />
        );
    }

    return <>{children}</>;
}