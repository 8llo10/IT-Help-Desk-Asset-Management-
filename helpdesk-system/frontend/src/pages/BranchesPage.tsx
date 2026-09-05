import {
    useEffect,
    useState,
} from "react";

import api from "../api/client";

interface Organization {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
    code?: string | null;

    organizationId?: number;

    organization?: Organization | null;

    isActive?: boolean;
}

export default function BranchesPage() {
    const [branches, setBranches] =
        useState<Branch[]>([]);

    const [
        organizations,
        setOrganizations,
    ] =
        useState<Organization[]>([]);

    const [name, setName] =
        useState("");

    const [code, setCode] =
        useState("");

    const [
        organizationId,
        setOrganizationId,
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
                branchesResponse,
                organizationsResponse,
            ] =
                await Promise.all([
                    api.get("/branches"),
                    api.get(
                        "/organizations"
                    ),
                ]);

            const branchesData =
                branchesResponse.data?.data
                    ?.branches ??
                branchesResponse.data?.data ??
                [];

            const organizationsData =
                organizationsResponse.data
                    ?.data?.organizations ??
                organizationsResponse.data
                    ?.data ??
                [];

            setBranches(
                Array.isArray(
                    branchesData
                )
                    ? branchesData
                    : []
            );

            setOrganizations(
                Array.isArray(
                    organizationsData
                )
                    ? organizationsData
                    : []
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load branches"
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

        if (
            !name.trim() ||
            !organizationId
        ) {
            setError(
                "Branch name and organization are required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.post(
                "/branches",
                {
                    name:
                        name.trim(),

                    organizationId:
                        Number(
                            organizationId
                        ),

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
            setOrganizationId("");

            setMessage(
                "Branch created successfully."
            );

            await fetchData();
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to create branch"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <p>
                Loading branches...
            </p>
        );
    }

    return (
        <div>
            <div>
                <h1>
                    Branches
                </h1>

                <p>
                    Manage organization
                    branches.
                </p>

                <p>
                    Total:{" "}
                    {branches.length}
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
                        Organization
                    </label>

                    <select
                        value={
                            organizationId
                        }
                        disabled={saving}
                        onChange={(event) =>
                            setOrganizationId(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Select Organization
                        </option>

                        {organizations.map(
                            (organization) => (
                                <option
                                    key={
                                        organization.id
                                    }
                                    value={
                                        organization.id
                                    }
                                >
                                    {
                                        organization.name
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div>
                    <label>
                        Branch Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        placeholder="Makkah Branch"
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
                        placeholder="MKH"
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
                        !name.trim() ||
                        !organizationId
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Add Branch"}
                </button>
            </form>

            <hr />

            {branches.length === 0 ? (
                <p>
                    No branches found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>

                            <th>
                                Branch
                            </th>

                            <th>
                                Code
                            </th>

                            <th>
                                Organization
                            </th>

                            <th>
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {branches.map(
                            (branch) => (
                                <tr
                                    key={
                                        branch.id
                                    }
                                >
                                    <td>
                                        {branch.id}
                                    </td>

                                    <td>
                                        {
                                            branch.name
                                        }
                                    </td>

                                    <td>
                                        {branch.code ??
                                            "—"}
                                    </td>

                                    <td>
                                        {branch
                                            .organization
                                            ?.name ??
                                            organizations.find(
                                                (
                                                    organization
                                                ) =>
                                                    organization.id ===
                                                    branch.organizationId
                                            )?.name ??
                                            "—"}
                                    </td>

                                    <td>
                                        {branch.isActive ===
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