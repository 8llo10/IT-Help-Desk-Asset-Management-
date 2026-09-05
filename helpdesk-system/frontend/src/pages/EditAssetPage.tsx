import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../api/client";

type AssetStatus =
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";

interface User {
    id: number;
    fullName: string;
    email: string;
    isActive?: boolean;
}

interface Department {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    assetTag: string;
    type: string;

    brand?: string | null;
    model?: string | null;
    serialNumber?: string | null;

    status: AssetStatus;

    purchaseDate?: string | null;
    warrantyExpiry?: string | null;

    assignedUser?: User | null;

    department?: Department | null;
}

export default function EditAssetPage() {
    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const assetId =
        Number(id);

    const [assetTag, setAssetTag] =
        useState("");

    const [type, setType] =
        useState("");

    const [brand, setBrand] =
        useState("");

    const [model, setModel] =
        useState("");

    const [
        serialNumber,
        setSerialNumber,
    ] =
        useState("");

    const [status, setStatus] =
        useState<AssetStatus>(
            "AVAILABLE"
        );

    const [
        purchaseDate,
        setPurchaseDate,
    ] =
        useState("");

    const [
        warrantyExpiry,
        setWarrantyExpiry,
    ] =
        useState("");

    const [
        assignedUserId,
        setAssignedUserId,
    ] =
        useState("");

    const [
        departmentId,
        setDepartmentId,
    ] =
        useState("");

    const [users, setUsers] =
        useState<User[]>([]);

    const [
        departments,
        setDepartments,
    ] =
        useState<Department[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadData = async () => {
            if (
                !Number.isFinite(assetId)
            ) {
                setError(
                    "Invalid asset ID."
                );

                setLoading(false);
                return;
            }

            try {
                setError("");

                const [
                    assetsResponse,
                    usersResponse,
                    departmentsResponse,
                ] =
                    await Promise.all([
                        api.get("/assets"),
                        api.get("/users"),
                        api.get(
                            "/departments"
                        ),
                    ]);

                const assetsData =
                    assetsResponse.data?.data
                        ?.assets ??
                    assetsResponse.data?.data ??
                    [];

                const usersData =
                    usersResponse.data?.data
                        ?.users ??
                    usersResponse.data?.data ??
                    [];

                const departmentsData =
                    departmentsResponse.data
                        ?.data?.departments ??
                    departmentsResponse.data
                        ?.data ??
                    [];

                const assets: Asset[] =
                    Array.isArray(
                        assetsData
                    )
                        ? assetsData
                        : [];

                const asset =
                    assets.find(
                        (item) =>
                            item.id === assetId
                    );

                if (!asset) {
                    setError(
                        "Asset not found."
                    );

                    return;
                }

                setAssetTag(
                    asset.assetTag
                );

                setType(
                    asset.type
                );

                setBrand(
                    asset.brand ?? ""
                );

                setModel(
                    asset.model ?? ""
                );

                setSerialNumber(
                    asset.serialNumber ??
                    ""
                );

                setStatus(
                    asset.status
                );

                setPurchaseDate(
                    asset.purchaseDate
                        ? asset.purchaseDate.slice(
                            0,
                            10
                        )
                        : ""
                );

                setWarrantyExpiry(
                    asset.warrantyExpiry
                        ? asset.warrantyExpiry.slice(
                            0,
                            10
                        )
                        : ""
                );

                setAssignedUserId(
                    asset.assignedUser?.id
                        ? String(
                            asset.assignedUser
                                .id
                        )
                        : ""
                );

                setDepartmentId(
                    asset.department?.id
                        ? String(
                            asset.department.id
                        )
                        : ""
                );

                setUsers(
                    Array.isArray(usersData)
                        ? usersData
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
                    error.response?.data
                        ?.message ??
                    "Failed to load asset data"
                );
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [assetId]);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!assetTag.trim()) {
            setError(
                "Asset tag is required."
            );

            return;
        }

        if (!type.trim()) {
            setError(
                "Asset type is required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");

            await api.patch(
                `/assets/${assetId}`,
                {
                    assetTag:
                        assetTag.trim(),

                    type:
                        type.trim(),

                    brand:
                        brand.trim() ||
                        null,

                    model:
                        model.trim() ||
                        null,

                    serialNumber:
                        serialNumber.trim() ||
                        null,

                    status,

                    assignedUserId:
                        assignedUserId
                            ? Number(
                                assignedUserId
                            )
                            : null,

                    departmentId:
                        departmentId
                            ? Number(
                                departmentId
                            )
                            : null,

                    purchaseDate:
                        purchaseDate ||
                        null,

                    warrantyExpiry:
                        warrantyExpiry ||
                        null,
                }
            );

            navigate(
                "/assets"
            );
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to update asset"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <p>
                Loading asset...
            </p>
        );
    }

    if (error && !assetTag) {
        return (
            <div>
                <p>{error}</p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/assets")
                    }
                >
                    Back to Assets
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1>
                Edit Asset
            </h1>

            <p>
                Update asset information,
                ownership and status.
            </p>

            {error && (
                <p>{error}</p>
            )}

            <form
                onSubmit={
                    handleSubmit
                }
            >
                <div>
                    <label>
                        Asset Tag
                    </label>

                    <input
                        type="text"
                        value={assetTag}
                        disabled={saving}
                        required
                        onChange={(event) =>
                            setAssetTag(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        Type
                    </label>

                    <input
                        type="text"
                        value={type}
                        disabled={saving}
                        required
                        onChange={(event) =>
                            setType(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        Brand
                    </label>

                    <input
                        type="text"
                        value={brand}
                        disabled={saving}
                        onChange={(event) =>
                            setBrand(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        Model
                    </label>

                    <input
                        type="text"
                        value={model}
                        disabled={saving}
                        onChange={(event) =>
                            setModel(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        Serial Number
                    </label>

                    <input
                        type="text"
                        value={
                            serialNumber
                        }
                        disabled={saving}
                        onChange={(event) =>
                            setSerialNumber(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        Status
                    </label>

                    <select
                        value={status}
                        disabled={saving}
                        onChange={(event) =>
                            setStatus(
                                event.target
                                    .value as AssetStatus
                            )
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
                    <label>
                        Assigned User
                    </label>

                    <select
                        value={
                            assignedUserId
                        }
                        disabled={saving}
                        onChange={(event) =>
                            setAssignedUserId(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Unassigned
                        </option>

                        {users
                            .filter(
                                (user) =>
                                    user.isActive !==
                                    false
                            )
                            .map((user) => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.fullName} (
                                    {user.email})
                                </option>
                            ))}
                    </select>
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

                <div>
                    <label>
                        Purchase Date
                    </label>

                    <input
                        type="date"
                        value={purchaseDate}
                        disabled={saving}
                        onChange={(event) =>
                            setPurchaseDate(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        Warranty Expiry
                    </label>

                    <input
                        type="date"
                        value={
                            warrantyExpiry
                        }
                        disabled={saving}
                        onChange={(event) =>
                            setWarrantyExpiry(
                                event.target.value
                            )
                        }
                    />
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
                    disabled={saving}
                    onClick={() =>
                        navigate("/assets")
                    }
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}