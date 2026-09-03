import { useEffect, useState } from "react";
import api from "../api/client";

type Department = {
    id: number;
    name: string;
};

type User = {
    id: number;
    fullName: string;
    email: string;
    role: "EMPLOYEE" | "TECHNICIAN" | "ADMIN";
    isActive: boolean;
    departmentId?: number | null;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setError("");

            const [usersResponse, departmentsResponse] =
                await Promise.all([
                    api.get("/users"),
                    api.get("/departments"),
                ]);

            setUsers(usersResponse.data.data.users);

            setDepartments(
                departmentsResponse.data.data.departments
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateUser = async (
        userId: number,
        data: {
            role?: "EMPLOYEE" | "TECHNICIAN" | "ADMIN";
            isActive?: boolean;
            departmentId?: number | null;
        }
    ) => {
        try {
            setError("");

            await api.patch(`/users/${userId}`, data);

            await fetchData();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to update user"
            );
        }
    };

    if (loading) {
        return <p>Loading users...</p>;
    }

    return (
        <div>
            <div>
                <h1>Users</h1>
                <p>Manage system users, roles and departments.</p>
            </div>

            {error && <p>{error}</p>}

            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.fullName}</td>

                                <td>{user.email}</td>

                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) =>
                                            updateUser(user.id, {
                                                role: e.target.value as User["role"],
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
                                            Admin
                                        </option>
                                    </select>
                                </td>

                                <td>
                                    <select
                                        value={user.departmentId ?? ""}
                                        onChange={(e) =>
                                            updateUser(user.id, {
                                                departmentId: e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            })
                                        }
                                    >
                                        <option value="">
                                            No Department
                                        </option>

                                        {departments.map((department) => (
                                            <option
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td>
                                    <select
                                        value={
                                            user.isActive
                                                ? "ACTIVE"
                                                : "INACTIVE"
                                        }
                                        onChange={(e) =>
                                            updateUser(user.id, {
                                                isActive:
                                                    e.target.value === "ACTIVE",
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}