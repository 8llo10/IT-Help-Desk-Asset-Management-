import {
    useEffect,
    useState,
} from "react";

import api from "../api/client";

interface Organization {
    id: number;
    name: string;
    code?: string | null;
    isActive?: boolean;
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] =
        useState<Organization[]>([]);

    const [name, setName] =
        useState("");

    const [code, setCode] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const fetchOrganizations = async () => {
        try {
            setError("");

            const response =
                await api.get("/organizations");

            const data =
                response.data?.data?.organizations ??
                response.data?.data ??
                [];

            setOrganizations(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load organizations"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchOrganizations();
    }, []);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            setError(
                "Organization name is required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.post(
                "/organizations",
                {
                    name: trimmedName,

                    ...(code.trim()
                        ? {
                            code:
                                code
                                    .trim()
                                    .toUpperCase(),
                        }
                        : {}),
                }
            );

            setName("");
            setCode("");

            setMessage(
                "Organization created successfully."
            );

            await fetchOrganizations();
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to create organization"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <p>
                Loading organizations...
            </p>
        );
    }

    return (
        <div>
            <div>
                <h1>
                    Organizations
                </h1>

                <p>
                    Manage organizations
                    registered in WASL.
                </p>

                <p>
                    Total:{" "}
                    {organizations.length}
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
                        Organization Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        placeholder="WASL Company"
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
                        Code
                    </label>

                    <input
                        type="text"
                        value={code}
                        placeholder="WASL"
                        disabled={saving}
                        onChange={(event) =>
                            setCode(
                                event.target.value
                            )
                        }
                    />
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
                        : "Add Organization"}
                </button>
            </form>

            <hr />

            {organizations.length === 0 ? (
                <p>
                    No organizations found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>
                                ID
                            </th>

                            <th>
                                Organization
                            </th>

                            <th>
                                Code
                            </th>

                            <th>
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {organizations.map(
                            (organization) => (
                                <tr
                                    key={
                                        organization.id
                                    }
                                >
                                    <td>
                                        {
                                            organization.id
                                        }
                                    </td>

                                    <td>
                                        {
                                            organization.name
                                        }
                                    </td>

                                    <td>
                                        {
                                            organization.code ??
                                            "—"
                                        }
                                    </td>

                                    <td>
                                        {organization.isActive ===
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