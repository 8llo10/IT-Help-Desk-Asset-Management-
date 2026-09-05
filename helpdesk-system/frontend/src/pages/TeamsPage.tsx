import {
    useEffect,
    useState,
} from "react";

import api from "../api/client";

interface Department {
    id: number;
    name: string;
}

interface Team {
    id: number;
    name: string;

    departmentId?: number | null;

    department?: Department | null;

    isActive?: boolean;
}

export default function TeamsPage() {
    const [teams, setTeams] =
        useState<Team[]>([]);

    const [
        departments,
        setDepartments,
    ] =
        useState<Department[]>([]);

    const [name, setName] =
        useState("");

    const [
        departmentId,
        setDepartmentId,
    ] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const fetchData = async () => {
        try {
            setError("");

            const [
                teamsResponse,
                departmentsResponse,
            ] =
                await Promise.all([
                    api.get("/teams"),

                    api.get(
                        "/departments"
                    ),
                ]);

            const teamsData =
                teamsResponse.data?.data
                    ?.teams ??
                teamsResponse.data?.data ??
                [];

            const departmentsData =
                departmentsResponse.data
                    ?.data?.departments ??
                departmentsResponse.data
                    ?.data ??
                [];

            setTeams(
                Array.isArray(
                    teamsData
                )
                    ? teamsData
                    : []
            );

            setDepartments(
                Array.isArray(
                    departmentsData
                )
                    ? departmentsData
                    : []
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load teams"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!name.trim()) {
            setError(
                "Team name is required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.post(
                "/teams",
                {
                    name:
                        name.trim(),

                    ...(departmentId
                        ? {
                            departmentId:
                                Number(
                                    departmentId
                                ),
                        }
                        : {}),
                }
            );

            setName("");
            setDepartmentId("");

            setMessage(
                "Team created successfully."
            );

            await fetchData();
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to create team"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <p>
                Loading teams...
            </p>
        );
    }

    return (
        <div>
            <div>
                <h1>
                    Teams
                </h1>

                <p>
                    Manage internal work
                    teams.
                </p>

                <p>
                    Total: {teams.length}
                </p>
            </div>

            {error && (
                <p>{error}</p>
            )}

            {message && (
                <p>{message}</p>
            )}

            <form
                onSubmit={
                    handleSubmit
                }
            >
                <div>
                    <label>
                        Team Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        placeholder="Service Desk Team"
                        disabled={saving}
                        onChange={(event) =>
                            setName(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        Department
                    </label>

                    <select
                        value={
                            departmentId
                        }
                        disabled={saving}
                        onChange={(event) =>
                            setDepartmentId(
                                event.target.value
                            )
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
                </div>

                <button
                    type="submit"
                    disabled={
                        saving ||
                        !name.trim()
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Add Team"}
                </button>
            </form>

            <hr />

            {teams.length === 0 ? (
                <p>
                    No teams found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>

                            <th>
                                Team
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {teams.map(
                            (team) => (
                                <tr
                                    key={
                                        team.id
                                    }
                                >
                                    <td>
                                        {team.id}
                                    </td>

                                    <td>
                                        {team.name}
                                    </td>

                                    <td>
                                        {team
                                            .department
                                            ?.name ??
                                            departments.find(
                                                (
                                                    department
                                                ) =>
                                                    department.id ===
                                                    team.departmentId
                                            )?.name ??
                                            "—"}
                                    </td>

                                    <td>
                                        {team.isActive ===
                                            false
                                            ? "Inactive"
                                            : "Active"}
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