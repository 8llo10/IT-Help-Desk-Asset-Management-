import {
    useEffect,
    useState,
} from "react";

import api from "../api/client";

interface Branch {
    id: number;
    name: string;
}

interface Location {
    id: number;
    name: string;

    branchId?: number | null;

    branch?: Branch | null;

    floor?: string | null;
    room?: string | null;

    isActive?: boolean;
}

export default function LocationsPage() {
    const [locations, setLocations] =
        useState<Location[]>([]);

    const [branches, setBranches] =
        useState<Branch[]>([]);

    const [name, setName] =
        useState("");

    const [branchId, setBranchId] =
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
                locationsResponse,
                branchesResponse,
            ] =
                await Promise.all([
                    api.get("/locations"),
                    api.get("/branches"),
                ]);

            const locationsData =
                locationsResponse.data?.data
                    ?.locations ??
                locationsResponse.data?.data ??
                [];

            const branchesData =
                branchesResponse.data?.data
                    ?.branches ??
                branchesResponse.data?.data ??
                [];

            setLocations(
                Array.isArray(
                    locationsData
                )
                    ? locationsData
                    : []
            );

            setBranches(
                Array.isArray(
                    branchesData
                )
                    ? branchesData
                    : []
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load locations"
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
            !branchId
        ) {
            setError(
                "Location name and branch are required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.post(
                "/locations",
                {
                    name:
                        name.trim(),

                    branchId:
                        Number(branchId),
                }
            );

            setName("");
            setBranchId("");

            setMessage(
                "Location created successfully."
            );

            await fetchData();
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to create location"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <p>
                Loading locations...
            </p>
        );
    }

    return (
        <div>
            <div>
                <h1>
                    Locations
                </h1>

                <p>
                    Manage physical work
                    locations.
                </p>

                <p>
                    Total:{" "}
                    {locations.length}
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
                        Branch
                    </label>

                    <select
                        value={branchId}
                        disabled={saving}
                        onChange={(event) =>
                            setBranchId(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Select Branch
                        </option>

                        {branches.map(
                            (branch) => (
                                <option
                                    key={
                                        branch.id
                                    }
                                    value={
                                        branch.id
                                    }
                                >
                                    {
                                        branch.name
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div>
                    <label>
                        Location Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        placeholder="IT Office - Floor 2"
                        disabled={saving}
                        onChange={(event) =>
                            setName(
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
                        !branchId
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Add Location"}
                </button>
            </form>

            <hr />

            {locations.length === 0 ? (
                <p>
                    No locations found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>

                            <th>
                                Location
                            </th>

                            <th>
                                Branch
                            </th>

                            <th>
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {locations.map(
                            (location) => (
                                <tr
                                    key={
                                        location.id
                                    }
                                >
                                    <td>
                                        {
                                            location.id
                                        }
                                    </td>

                                    <td>
                                        {
                                            location.name
                                        }
                                    </td>

                                    <td>
                                        {location
                                            .branch
                                            ?.name ??
                                            branches.find(
                                                (branch) =>
                                                    branch.id ===
                                                    location.branchId
                                            )?.name ??
                                            "—"}
                                    </td>

                                    <td>
                                        {location.isActive ===
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