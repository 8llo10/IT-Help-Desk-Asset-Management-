import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getRoles,
} from "../api/roles.api";

interface Role {
    id: number;
    name: string;
    code: string;

    description?: string | null;

    organizationId?: number | null;

    permissions?: unknown[];

    _count?: {
        users?: number;
        permissions?: number;
    };
}

export default function RolesPage() {
    const navigate =
        useNavigate();

    const [roles, setRoles] =
        useState<Role[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchRoles =
            async () => {
                try {
                    setError("");

                    const response =
                        await getRoles();

                    const rolesData =
                        response.data?.data
                            ?.roles ??
                        response.data?.data ??
                        [];

                    setRoles(
                        Array.isArray(
                            rolesData
                        )
                            ? rolesData
                            : []
                    );
                } catch (error: any) {
                    setError(
                        error.response?.data
                            ?.message ??
                        "Failed to load roles"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void fetchRoles();
    }, []);

    if (loading) {
        return (
            <p>
                Loading roles...
            </p>
        );
    }

    return (
        <div>

            <div>
                <h1>
                    Roles & Permissions
                </h1>

                <p>
                    Manage WASL system roles
                    and access permissions.
                </p>
            </div>

            {error && (
                <p>
                    {error}
                </p>
            )}

            {roles.length === 0 ? (
                <p>
                    No roles found.
                </p>
            ) : (
                <table>

                    <thead>
                        <tr>
                            <th>
                                Role
                            </th>

                            <th>
                                Code
                            </th>

                            <th>
                                Users
                            </th>

                            <th>
                                Permissions
                            </th>

                            <th>
                                Scope
                            </th>

                            <th>
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {roles.map(
                            (role) => (
                                <tr key={role.id}>

                                    <td>
                                        <strong>
                                            {role.name}
                                        </strong>

                                        <div>
                                            {
                                                role.description ??
                                                ""
                                            }
                                        </div>
                                    </td>

                                    <td>
                                        {role.code}
                                    </td>

                                    <td>
                                        {role._count
                                            ?.users ?? 0}
                                    </td>

                                    <td>
                                        {role._count
                                            ?.permissions ??
                                            role.permissions
                                                ?.length ??
                                            0}
                                    </td>

                                    <td>
                                        {role.organizationId
                                            ? "Organization"
                                            : "Global"}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/roles/${role.id}`
                                                )
                                            }
                                        >
                                            Manage
                                        </button>
                                    </td>

                                </tr>
                            )
                        )}
                    </tbody>

                </table>
            )}

        </div>
    );
}