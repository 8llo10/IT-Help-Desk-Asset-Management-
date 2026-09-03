import { useEffect, useState } from "react";
import api from "../api/client";

type Department = {
    id: number;
    name: string;
};

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [name, setName] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const fetchDepartments = async () => {
        try {
            setError("");

            const response = await api.get("/departments");

            setDepartments(
                response.data.data.departments
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to load departments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {
            setCreating(true);
            setError("");

            await api.post("/departments", {
                name: name.trim(),
            });

            setName("");

            await fetchDepartments();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to create department"
            );
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <p>Loading departments...</p>;
    }

    return (
        <div>
            <div>
                <h1>Departments</h1>

                <p>
                    Manage company departments.
                </p>
            </div>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label>Department Name</label>

                <input
                    type="text"
                    placeholder="Information Technology"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

                <button
                    type="submit"
                    disabled={creating}
                >
                    {creating
                        ? "Adding..."
                        : "+ Add Department"}
                </button>
            </form>

            <hr />

            {departments.length === 0 ? (
                <p>No departments found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Department</th>
                        </tr>
                    </thead>

                    <tbody>
                        {departments.map(
                            (department) => (
                                <tr key={department.id}>
                                    <td>
                                        {department.id}
                                    </td>

                                    <td>
                                        {department.name}
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