import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import api from "../api/client";

type UserRole =
    | "EMPLOYEE"
    | "TECHNICIAN"
    | "ADMIN";

interface Organization {
    id: number;
    name: string;
    code?: string;
}

interface Department {
    id: number;
    name: string;
}

interface User {
    id: number;
    fullName: string;
    email: string;
    employeeNumber?: string | null;
    jobTitle?: string | null;
    role: UserRole;
    isActive: boolean;

    organization?: Organization | null;
    department?: Department | null;
}

export default function UsersPage() {
    const navigate = useNavigate();

    const [users, setUsers] =
        useState<User[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/users");

            const data =
                response.data?.data;

            setUsers(
                data?.users ??
                data ??
                []
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUsers();
    }, []);

    const filteredUsers =
        useMemo(() => {
            return users.filter((user) => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase();

                const matchesSearch =
                    !normalizedSearch ||
                    user.fullName
                        .toLowerCase()
                        .includes(normalizedSearch) ||
                    user.email
                        .toLowerCase()
                        .includes(normalizedSearch) ||
                    user.employeeNumber
                        ?.toLowerCase()
                        .includes(
                            normalizedSearch
                        ) ||
                    user.jobTitle
                        ?.toLowerCase()
                        .includes(
                            normalizedSearch
                        );

                const matchesRole =
                    !roleFilter ||
                    user.role === roleFilter;

                const matchesStatus =
                    !statusFilter ||
                    (
                        statusFilter ===
                            "ACTIVE"
                            ? user.isActive
                            : !user.isActive
                    );

                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );
            });
        }, [
            users,
            search,
            roleFilter,
            statusFilter,
        ]);

    if (loading) {
        return (
            <p>
                Loading users...
            </p>
        );
    }

    return (
        <div>

            <div>
                <h1>Users</h1>

                <p>
                    Manage WASL users and their
                    system access.
                </p>
            </div>

            {error && (
                <p>
                    {error}
                </p>
            )}

            <div>
                <input
                    type="search"
                    placeholder="Search name, email or employee number..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

                <select
                    value={roleFilter}
                    onChange={(event) =>
                        setRoleFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="">
                        All Roles
                    </option>

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

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="">
                        All Statuses
                    </option>

                    <option value="ACTIVE">
                        Active
                    </option>

                    <option value="INACTIVE">
                        Inactive
                    </option>
                </select>
            </div>

            {filteredUsers.length === 0 ? (
                <p>
                    No users found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Employee Number</th>
                            <th>Job Title</th>
                            <th>Base Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map(
                            (user) => (
                                <tr key={user.id}>

                                    <td>
                                        <strong>
                                            {user.fullName}
                                        </strong>

                                        <div>
                                            {user.email}
                                        </div>
                                    </td>

                                    <td>
                                        {user.employeeNumber ??
                                            "—"}
                                    </td>

                                    <td>
                                        {user.jobTitle ??
                                            "—"}
                                    </td>

                                    <td>
                                        {user.role}
                                    </td>

                                    <td>
                                        {user.department?.name ??
                                            "—"}
                                    </td>

                                    <td>
                                        {user.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/users/${user.id}`
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