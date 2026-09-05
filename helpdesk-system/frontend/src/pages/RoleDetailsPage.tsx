import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    getRole,
} from "../api/roles.api";

interface Permission {
    id: number;
    name: string;
    code: string;
}

interface RolePermission {
    id?: number;
    permissionId?: number;
    permission: Permission;
}

interface Role {
    id: number;
    name: string;
    code: string;

    description?: string | null;

    organizationId?: number | null;

    permissions?: RolePermission[];

    _count?: {
        users?: number;
        permissions?: number;
    };
}

export default function RoleDetailsPage() {
    const { id } =
        useParams();

    const roleId =
        Number(id);

    const [role, setRole] =
        useState<Role | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchRole =
            async () => {
                if (
                    !Number.isFinite(roleId)
                ) {
                    setError(
                        "Invalid role ID"
                    );

                    setLoading(false);
                    return;
                }

                try {
                    setError("");

                    const response =
                        await getRole(
                            roleId
                        );

                    const roleData =
                        response.data?.data
                            ?.role ??
                        response.data?.data;

                    setRole(roleData);
                } catch (error: any) {
                    setError(
                        error.response?.data
                            ?.message ??
                        "Failed to load role"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void fetchRole();
    }, [roleId]);

    if (loading) {
        return (
            <p>
                Loading role...
            </p>
        );
    }

    if (!role) {
        return (
            <div>

                <p>
                    {error ||
                        "Role not found."}
                </p>

                <Link to="/roles">
                    Back to Roles
                </Link>

            </div>
        );
    }

    return (
        <div>

            <Link to="/roles">
                ← Roles
            </Link>

            <h1>
                {role.name}
            </h1>

            <p>
                {role.description}
            </p>

            {error && (
                <p>
                    {error}
                </p>
            )}

            <section>
                <h2>
                    Role Information
                </h2>

                <p>
                    <strong>
                        ID:
                    </strong>{" "}
                    {role.id}
                </p>

                <p>
                    <strong>
                        Code:
                    </strong>{" "}
                    {role.code}
                </p>

                <p>
                    <strong>
                        Scope:
                    </strong>{" "}
                    {role.organizationId
                        ? "Organization"
                        : "Global"}
                </p>

                <p>
                    <strong>
                        Assigned Users:
                    </strong>{" "}
                    {role._count?.users ??
                        0}
                </p>
            </section>

            <hr />

            <section>

                <h2>
                    Permissions
                </h2>

                {!role.permissions ||
                    role.permissions.length ===
                    0 ? (
                    <p>
                        No permissions assigned.
                    </p>
                ) : (
                    <table>

                        <thead>
                            <tr>
                                <th>
                                    Permission
                                </th>

                                <th>
                                    Code
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {role.permissions.map(
                                (item) => (
                                    <tr
                                        key={
                                            item.permission
                                                .id
                                        }
                                    >
                                        <td>
                                            {
                                                item.permission
                                                    .name
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.permission
                                                    .code
                                            }
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>

                    </table>
                )}

            </section>

        </div>
    );
}