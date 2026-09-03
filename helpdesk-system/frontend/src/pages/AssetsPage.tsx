import { useEffect, useState } from "react";
import api from "../api/client";
import { Link } from "react-router-dom";

type Asset = {
    id: number;
    assetTag: string;
    type: string;
    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;

    status:
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";

    assignedUser?: {
        id: number;
        fullName: string;
        email: string;
    } | null;

    department?: {
        id: number;
        name: string;
    } | null;
};

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setError("");

                const response = await api.get("/assets");

                setAssets(response.data.data.assets);
            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load assets"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    if (loading) {
        return <p>Loading assets...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <div>
                <h1>Assets</h1>

                <p>
                    Manage company IT assets and devices.
                </p>

                <Link to="/assets/new">
                    + Add Asset
                </Link>
            </div>

            {assets.length === 0 ? (
                <p>No assets found.</p>
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
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.id}>
                                <td>
                                    {asset.assetTag}
                                </td>

                                <td>
                                    {asset.type}
                                </td>

                                <td>
                                    {asset.brand || "-"}
                                </td>

                                <td>
                                    {asset.model || "-"}
                                </td>

                                <td>
                                    {asset.serialNumber || "-"}
                                </td>

                                <td>
                                    {asset.status}
                                </td>

                                <td>
                                    {asset.assignedUser?.fullName ||
                                        "Unassigned"}
                                </td>

                                <td>
                                    {asset.department?.name || "-"}
                                </td>

                                <td>
                                    <Link
                                        to={`/assets/${asset.id}/edit`}
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}