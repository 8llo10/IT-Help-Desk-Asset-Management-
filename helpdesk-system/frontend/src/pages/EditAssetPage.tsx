import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

type User = {
    id: number;
    fullName: string;
    email: string;
};

type Department = {
    id: number;
    name: string;
};

type Asset = {
    id: number;
    assetTag: string;
    type: string;
    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";

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

export default function EditAssetPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [assetTag, setAssetTag] = useState("");
    const [type, setType] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [status, setStatus] = useState("AVAILABLE");

    const [assignedUserId, setAssignedUserId] = useState("");
    const [departmentId, setDepartmentId] = useState("");

    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    assetsResponse,
                    usersResponse,
                    departmentsResponse,
                ] = await Promise.all([
                    api.get("/assets"),
                    api.get("/users"),
                    api.get("/departments"),
                ]);

                const assets: Asset[] =
                    assetsResponse.data.data.assets;

                const asset = assets.find(
                    (item) => item.id === Number(id)
                );

                if (!asset) {
                    setError("Asset not found");
                    return;
                }

                setAssetTag(asset.assetTag);
                setType(asset.type);
                setBrand(asset.brand || "");
                setModel(asset.model || "");
                setSerialNumber(asset.serialNumber || "");
                setStatus(asset.status);

                setAssignedUserId(
                    asset.assignedUser?.id
                        ? String(asset.assignedUser.id)
                        : ""
                );

                setDepartmentId(
                    asset.department?.id
                        ? String(asset.department.id)
                        : ""
                );

                setUsers(usersResponse.data.data.users);

                setDepartments(
                    departmentsResponse.data.data.departments
                );
            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load asset data"
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            await api.patch(`/assets/${id}`, {
                assetTag: assetTag.trim(),
                type: type.trim(),
                brand: brand.trim() || null,
                model: model.trim() || null,
                serialNumber: serialNumber.trim() || null,
                status,

                assignedUserId: assignedUserId
                    ? Number(assignedUserId)
                    : null,

                departmentId: departmentId
                    ? Number(departmentId)
                    : null,
            });

            navigate("/assets");
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to update asset"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Loading asset...</p>;
    }

    return (
        <div>
            <h1>Edit Asset</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Asset Tag</label>

                    <input
                        value={assetTag}
                        onChange={(e) =>
                            setAssetTag(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Type</label>

                    <input
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Brand</label>

                    <input
                        value={brand}
                        onChange={(e) =>
                            setBrand(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Model</label>

                    <input
                        value={model}
                        onChange={(e) =>
                            setModel(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Serial Number</label>

                    <input
                        value={serialNumber}
                        onChange={(e) =>
                            setSerialNumber(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Status</label>

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >
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

                <div>
                    <label>Assigned User</label>

                    <select
                        value={assignedUserId}
                        onChange={(e) =>
                            setAssignedUserId(e.target.value)
                        }
                    >
                        <option value="">
                            Unassigned
                        </option>

                        {users.map((user) => (
                            <option
                                key={user.id}
                                value={user.id}
                            >
                                {user.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Department</label>

                    <select
                        value={departmentId}
                        onChange={(e) =>
                            setDepartmentId(e.target.value)
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
                </div>

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/assets")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}