import {
    useEffect,
    useState,
} from "react";

import {
    createDepartment,
    getDepartments,
    updateDepartment,
} from "../api/departments.api";

interface Department {
    id: number;
    name: string;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] =
        useState<Department[]>([]);

    const [name, setName] =
        useState("");

    const [
        editingId,
        setEditingId,
    ] = useState<number | null>(
        null
    );

    const [
        editingName,
        setEditingName,
    ] = useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const fetchDepartments =
        async () => {
            try {
                setError("");

                const response =
                    await getDepartments();

                const data =
                    response.data?.data
                        ?.departments ??
                    response.data?.data ??
                    [];

                setDepartments(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to load departments"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchDepartments();
    }, []);

    const handleCreate = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            return;
        }

        const alreadyExists =
            departments.some(
                (department) =>
                    department.name
                        .trim()
                        .toLowerCase() ===
                    trimmedName.toLowerCase()
            );

        if (alreadyExists) {
            setError(
                "Department already exists."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await createDepartment({
                name: trimmedName,
            });

            setName("");

            setMessage(
                "Department created successfully."
            );

            await fetchDepartments();
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to create department"
            );
        } finally {
            setSaving(false);
        }
    };

    const startEditing = (
        department: Department
    ) => {
        setEditingId(
            department.id
        );

        setEditingName(
            department.name
        );

        setError("");
        setMessage("");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEditing = async (
        departmentId: number
    ) => {
        const trimmedName =
            editingName.trim();

        if (!trimmedName) {
            setError(
                "Department name is required."
            );

            return;
        }

        const alreadyExists =
            departments.some(
                (department) =>
                    department.id !==
                    departmentId &&
                    department.name
                        .trim()
                        .toLowerCase() ===
                    trimmedName.toLowerCase()
            );

        if (alreadyExists) {
            setError(
                "Department already exists."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await updateDepartment(
                departmentId,
                {
                    name: trimmedName,
                }
            );

            setEditingId(null);
            setEditingName("");

            setMessage(
                "Department updated successfully."
            );

            await fetchDepartments();
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to update department"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <p>
                Loading departments...
            </p>
        );
    }

    return (
        <div>

            <div>
                <h1>
                    Departments
                </h1>

                <p>
                    Manage company
                    departments.
                </p>

                <p>
                    Total:{" "}
                    {departments.length}
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

            <form
                onSubmit={
                    handleCreate
                }
            >
                <label>
                    Department Name
                </label>

                <input
                    type="text"
                    placeholder="Information Technology"
                    value={name}
                    onChange={(event) =>
                        setName(
                            event.target.value
                        )
                    }
                    disabled={saving}
                />

                <button
                    type="submit"
                    disabled={
                        saving ||
                        !name.trim()
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Add Department"}
                </button>
            </form>

            <hr />

            {departments.length === 0 ? (
                <p>
                    No departments found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>
                                ID
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {departments.map(
                            (department) => (
                                <tr
                                    key={
                                        department.id
                                    }
                                >
                                    <td>
                                        {
                                            department.id
                                        }
                                    </td>

                                    <td>
                                        {editingId ===
                                            department.id ? (
                                            <input
                                                type="text"
                                                value={
                                                    editingName
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEditingName(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        ) : (
                                            department.name
                                        )}
                                    </td>

                                    <td>
                                        {editingId ===
                                            department.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        saving
                                                    }
                                                    onClick={() =>
                                                        void saveEditing(
                                                            department.id
                                                        )
                                                    }
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        saving
                                                    }
                                                    onClick={
                                                        cancelEditing
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditing(
                                                        department
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}
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