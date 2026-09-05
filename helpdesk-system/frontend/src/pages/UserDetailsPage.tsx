import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import api from "../api/client";

import {
    assignRoleToUser,
    getRoles,
    getUserAccess,
    removeRoleFromUser,
} from "../api/roles.api";

type BaseRole =
    | "EMPLOYEE"
    | "TECHNICIAN"
    | "ADMIN";

interface Department {
    id: number;
    name: string;
}

interface SystemRole {
    id: number;
    name: string;
    code: string;
    description?: string | null;

    permissions?: Array<{
        permission?: {
            id: number;
            name: string;
            code: string;
        };
    }>;
}

interface User {
    id: number;
    fullName: string;
    email: string;

    employeeNumber?: string | null;
    jobTitle?: string | null;

    role: BaseRole;
    isActive: boolean;

    department?: Department | null;
    departmentId?: number | null;

    organization?: {
        id: number;
        name: string;
        code?: string;
    } | null;

    branch?: {
        id: number;
        name: string;
    } | null;

    location?: {
        id: number;
        name: string;
    } | null;

    team?: {
        id: number;
        name: string;
    } | null;

    manager?: {
        id: number;
        fullName: string;
        email: string;
    } | null;
}

export default function UserDetailsPage() {
    const { id } =
        useParams();

    const userId =
        Number(id);

    const [user, setUser] =
        useState<User | null>(null);

    const [departments, setDepartments] =
        useState<Department[]>([]);

    const [roles, setRoles] =
        useState<SystemRole[]>([]);

    const [
        assignedRoleIds,
        setAssignedRoleIds,
    ] = useState<number[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const extractAssignedRoleIds = (
        data: any
    ): number[] => {
        const possibleRoles =
            data?.roles ??
            data?.systemRoles ??
            data?.userRoles ??
            data?.access?.roles ??
            [];

        if (!Array.isArray(possibleRoles)) {
            return [];
        }

        return possibleRoles
            .map((item: any) =>
                Number(
                    item.roleId ??
                    item.role?.id ??
                    item.id
                )
            )
            .filter(
                (roleId: number) =>
                    Number.isFinite(roleId)
            );
    };

    const fetchData = async () => {
        if (!Number.isFinite(userId)) {
            setError(
                "Invalid user ID"
            );

            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [
                userResponse,
                departmentResponse,
                roleResponse,
                accessResponse,
            ] =
                await Promise.all([
                    api.get(
                        `/users/${userId}`
                    ),

                    api.get(
                        "/departments"
                    ),

                    getRoles(),

                    getUserAccess(
                        userId
                    ),
                ]);

            const userData =
                userResponse.data?.data
                    ?.user ??
                userResponse.data?.data;

            const departmentData =
                departmentResponse.data?.data
                    ?.departments ??
                departmentResponse.data?.data ??
                [];

            const rolesData =
                roleResponse.data?.data
                    ?.roles ??
                roleResponse.data?.data ??
                [];

            const accessData =
                accessResponse.data?.data ??
                {};

            setUser(userData);

            setDepartments(
                Array.isArray(
                    departmentData
                )
                    ? departmentData
                    : []
            );

            setRoles(
                Array.isArray(
                    rolesData
                )
                    ? rolesData
                    : []
            );

            setAssignedRoleIds(
                extractAssignedRoleIds(
                    accessData
                )
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load user information"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, [userId]);

    const updateUser = async (
        data: Partial<{
            role: BaseRole;
            isActive: boolean;
            departmentId: number | null;
            jobTitle: string | null;
        }>
    ) => {
        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.patch(
                `/users/${userId}`,
                data
            );

            setMessage(
                "User updated successfully."
            );

            await fetchData();
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to update user"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRoleToggle =
        async (
            role: SystemRole
        ) => {
            try {
                setSaving(true);
                setError("");
                setMessage("");

                const assigned =
                    assignedRoleIds.includes(
                        role.id
                    );

                if (assigned) {
                    await removeRoleFromUser(
                        role.id,
                        userId
                    );

                    setMessage(
                        `${role.name} removed.`
                    );
                } else {
                    await assignRoleToUser(
                        role.id,
                        userId
                    );

                    setMessage(
                        `${role.name} assigned.`
                    );
                }

                await fetchData();
            } catch (error: any) {
                setError(
                    error.response?.data?.message ??
                    "Failed to update user role"
                );
            } finally {
                setSaving(false);
            }
        };

    if (loading) {
        return (
            <p>
                Loading user...
            </p>
        );
    }

    if (!user) {
        return (
            <div>
                <p>
                    User not found.
                </p>

                <Link to="/users">
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <div>

            <div>
                <Link to="/users">
                    ← Users
                </Link>

                <h1>
                    {user.fullName}
                </h1>

                <p>
                    {user.email}
                </p>
            </div>

            {error && (
                <p>
                    {error}
                </p>
            )}

            {message && (
                <p>
                    {message}
                </p>
            )}

            <section>
                <h2>
                    Account
                </h2>

                <p>
                    <strong>
                        Employee Number:
                    </strong>{" "}
                    {user.employeeNumber ??
                        "—"}
                </p>

                <p>
                    <strong>
                        Email:
                    </strong>{" "}
                    {user.email}
                </p>

                <label>
                    Job Title

                    <input
                        type="text"
                        defaultValue={
                            user.jobTitle ?? ""
                        }
                        onBlur={(event) => {
                            const value =
                                event.target.value
                                    .trim();

                            if (
                                value !==
                                (
                                    user.jobTitle ??
                                    ""
                                )
                            ) {
                                void updateUser({
                                    jobTitle:
                                        value ||
                                        null,
                                });
                            }
                        }}
                        disabled={saving}
                    />
                </label>
            </section>

            <hr />

            <section>
                <h2>
                    Base Access
                </h2>

                <label>
                    Base Role

                    <select
                        value={user.role}
                        disabled={saving}
                        onChange={(event) =>
                            void updateUser({
                                role:
                                    event.target
                                        .value as BaseRole,
                            })
                        }
                    >
                        <option value="EMPLOYEE">
                            Employee
                        </option>

                        <option value="TECHNICIAN">
                            Technician
                        </option>

                        <option value="ADMIN">
                            Administrator
                        </option>
                    </select>
                </label>

                <label>
                    Account Status

                    <select
                        value={
                            user.isActive
                                ? "ACTIVE"
                                : "INACTIVE"
                        }
                        disabled={saving}
                        onChange={(event) =>
                            void updateUser({
                                isActive:
                                    event.target
                                        .value ===
                                    "ACTIVE",
                            })
                        }
                    >
                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>
                    </select>
                </label>

                <label>
                    Department

                    <select
                        value={
                            user.department?.id ??
                            user.departmentId ??
                            ""
                        }
                        disabled={saving}
                        onChange={(event) =>
                            void updateUser({
                                departmentId:
                                    event.target
                                        .value
                                        ? Number(
                                            event.target
                                                .value
                                        )
                                        : null,
                            })
                        }
                    >
                        <option value="">
                            No Department
                        </option>

                        {departments.map(
                            (department) => (
                                <option
                                    key={
                                        department.id
                                    }
                                    value={
                                        department.id
                                    }
                                >
                                    {
                                        department.name
                                    }
                                </option>
                            )
                        )}
                    </select>
                </label>
            </section>

            <hr />

            <section>
                <h2>
                    Organization
                </h2>

                <p>
                    <strong>
                        Organization:
                    </strong>{" "}
                    {user.organization
                        ?.name ?? "—"}
                </p>

                <p>
                    <strong>
                        Branch:
                    </strong>{" "}
                    {user.branch?.name ??
                        "—"}
                </p>

                <p>
                    <strong>
                        Location:
                    </strong>{" "}
                    {user.location?.name ??
                        "—"}
                </p>

                <p>
                    <strong>
                        Team:
                    </strong>{" "}
                    {user.team?.name ??
                        "—"}
                </p>

                <p>
                    <strong>
                        Manager:
                    </strong>{" "}
                    {user.manager
                        ?.fullName ?? "—"}
                </p>
            </section>

            <hr />

            <section>
                <h2>
                    System Roles
                </h2>

                <p>
                    Assign detailed permissions
                    through WASL system roles.
                </p>

                {roles.length === 0 ? (
                    <p>
                        No system roles found.
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
                                    Permissions
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {roles.map((role) => {
                                const assigned =
                                    assignedRoleIds.includes(
                                        role.id
                                    );

                                return (
                                    <tr key={role.id}>

                                        <td>
                                            <strong>
                                                {
                                                    role.name
                                                }
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
                                            {role.permissions
                                                ?.length ?? 0}
                                        </td>

                                        <td>
                                            {assigned
                                                ? "Assigned"
                                                : "Not Assigned"}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                disabled={
                                                    saving
                                                }
                                                onClick={() =>
                                                    void handleRoleToggle(
                                                        role
                                                    )
                                                }
                                            >
                                                {assigned
                                                    ? "Remove"
                                                    : "Assign"}
                                            </button>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </section>

        </div>
    );
}