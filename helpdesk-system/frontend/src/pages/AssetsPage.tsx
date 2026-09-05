import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

type AssetStatus =
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";

interface Asset {
    id: number;
    assetTag: string;
    type: string;
    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    status: AssetStatus;

    assignedUser?: {
        id: number;
        fullName: string;
        email: string;
    } | null;

    department?: {
        id: number;
        name: string;
    } | null;
}

export default function AssetsPage() {
    const { user } = useAuth();

    const [assets, setAssets] =
        useState<Asset[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("");

    const fetchAssets = async () => {
        try {
            setError("");

            const response =
                await api.get("/assets");

            const data =
                response.data?.data?.assets ??
                response.data?.data ??
                [];

            setAssets(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ??
                "Failed to load assets"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAssets();
    }, []);

    const filteredAssets =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return assets.filter((asset) => {
                const matchesSearch =
                    !query ||
                    asset.assetTag
                        .toLowerCase()
                        .includes(query) ||
                    asset.type
                        .toLowerCase()
                        .includes(query) ||
                    asset.brand
                        ?.toLowerCase()
                        .includes(query) ||
                    asset.model
                        ?.toLowerCase()
                        .includes(query) ||
                    asset.serialNumber
                        ?.toLowerCase()
                        .includes(query) ||
                    asset.assignedUser
                        ?.fullName
                        .toLowerCase()
                        .includes(query);

                const matchesStatus =
                    !statusFilter ||
                    asset.status ===
                    statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            });
        }, [
            assets,
            search,
            statusFilter,
        ]);

    if (loading) {
        return (
            <p>
                Loading assets...
            </p>
        );
    }

    return (
        <div>
            <div>
                <h1>Assets</h1>

                <p>
                    Manage company IT
                    assets and devices.
                </p>

                <p>
                    Total Assets:{" "}
                    {assets.length}
                </p>

                {user?.role === "ADMIN" && (
                    <Link to="/assets/new">
                        + Add Asset
                    </Link>
                )}
            </div>

            {error && (
                <p>{error}</p>
            )}

            <div>
                <input
                    type="search"
                    placeholder="Search assets..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

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

                    <option value="AVAILABLE">
                        Available
                    </option>

                    <option value="IN_USE">
                        In Use
                    </option>

                    <option value="MAINTENANCE">
                        Maintenance
                    </option>

                    <option value="RETIRED">
                        Retired
                    </option>
                </select>
            </div>

            <hr />

            {filteredAssets.length === 0 ? (
                <p>
                    No assets found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Asset Tag</th>
                            <th>Type</th>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Serial Number</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Department</th>

                            {user?.role ===
                                "ADMIN" && (
                                    <th>Actions</th>
                                )}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAssets.map(
                            (asset) => (
                                <tr key={asset.id}>
                                    <td>
                                        {asset.assetTag}
                                    </td>

                                    <td>
                                        {asset.type}
                                    </td>

                                    <td>
                                        {asset.brand ?? "—"}
                                    </td>

                                    <td>
                                        {asset.model ?? "—"}
                                    </td>

                                    <td>
                                        {asset.serialNumber ??
                                            "—"}
                                    </td>

                                    <td>
                                        {asset.status}
                                    </td>

                                    <td>
                                        {asset.assignedUser
                                            ?.fullName ??
                                            "Unassigned"}
                                    </td>

                                    <td>
                                        {asset.department
                                            ?.name ?? "—"}
                                    </td>

                                    {user?.role ===
                                        "ADMIN" && (
                                            <td>
                                                <Link
                                                    to={`/assets/${asset.id}/edit`}
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        )}
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}