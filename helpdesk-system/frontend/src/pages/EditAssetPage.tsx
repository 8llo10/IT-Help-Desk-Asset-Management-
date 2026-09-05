import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleUserRound,
    HardDrive,
    Hash,
    Laptop,
    PackageCheck,
    Save,
    ShieldCheck,
    Tag,
    UserRound,
    Wrench,
    XCircle,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../api/client";

import "../styles/EditAssetPage.css";

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

const statusLabels: Record<
    AssetStatus,
    string
> = {
    AVAILABLE: "Available",
    IN_USE: "In Use",
    MAINTENANCE: "Maintenance",
    RETIRED: "Retired",
};

export default function EditAssetPage() {
    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const assetId =
        Number(id);

    const [
        assetTag,
        setAssetTag,
    ] = useState("");

    const [
        type,
        setType,
    ] = useState("");

    const [
        brand,
        setBrand,
    ] = useState("");

    const [
        model,
        setModel,
    ] = useState("");

    const [
        serialNumber,
        setSerialNumber,
    ] = useState("");

    const [
        status,
        setStatus,
    ] =
        useState<AssetStatus>(
            "AVAILABLE"
        );

    const [
        purchaseDate,
        setPurchaseDate,
    ] = useState("");

    const [
        warrantyExpiry,
        setWarrantyExpiry,
    ] = useState("");

    const [
        assignedUserId,
        setAssignedUserId,
    ] = useState("");

    const [
        departmentId,
        setDepartmentId,
    ] = useState("");

    const [
        users,
        setUsers,
    ] =
        useState<User[]>([]);

    const [
        departments,
        setDepartments,
    ] =
        useState<Department[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    /* =========================================================
       LOAD DATA
       ========================================================= */

    useEffect(() => {
        const loadData =
            async () => {
                if (
                    !Number.isFinite(
                        assetId
                    )
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
                            api.get(
                                "/assets"
                            ),
                            api.get(
                                "/users"
                            ),
                            api.get(
                                "/departments"
                            ),
                        ]);

                    const assetsData =
                        assetsResponse.data
                            ?.data?.assets ??
                        assetsResponse.data
                            ?.data ??
                        [];

                    const usersData =
                        usersResponse.data
                            ?.data?.users ??
                        usersResponse.data
                            ?.data ??
                        [];

                    const departmentsData =
                        departmentsResponse
                            .data?.data
                            ?.departments ??
                        departmentsResponse
                            .data?.data ??
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
                                item.id ===
                                assetId
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
                        asset.assignedUser
                            ?.id
                            ? String(
                                asset
                                    .assignedUser
                                    .id
                            )
                            : ""
                    );

                    setDepartmentId(
                        asset.department?.id
                            ? String(
                                asset
                                    .department
                                    .id
                            )
                            : ""
                    );

                    setUsers(
                        Array.isArray(
                            usersData
                        )
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
                } catch (
                error: any
                ) {
                    setError(
                        error.response
                            ?.data?.message ??
                        "Failed to load asset data"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void loadData();
    }, [assetId]);

    /* =========================================================
       SAVE
       ========================================================= */

    const handleSubmit =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();

            if (
                !assetTag.trim()
            ) {
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
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to update asset"
                );
            } finally {
                setSaving(false);
            }
        };

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="edit-asset-loading">

                <div className="edit-asset-loading-icon">
                    <Laptop
                        size={25}
                    />
                </div>

                <strong>
                    Loading asset
                </strong>

                <p>
                    Retrieving device
                    information...
                </p>

            </div>
        );
    }

    /* =========================================================
       NOT FOUND
       ========================================================= */

    if (
        error &&
        !assetTag
    ) {
        return (
            <div className="edit-asset-not-found">

                <div className="edit-asset-not-found-icon">
                    <XCircle
                        size={28}
                    />
                </div>

                <h2>
                    Asset unavailable
                </h2>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/assets"
                        )
                    }
                >
                    <ArrowLeft
                        size={16}
                    />

                    Back to Assets
                </button>

            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="edit-asset-page">

            {/* BACK */}

            <button
                type="button"
                className="edit-asset-back"
                onClick={() =>
                    navigate(
                        "/assets"
                    )
                }
            >
                <ArrowLeft
                    size={15}
                />

                Asset Inventory
            </button>

            {/* HERO */}

            <section className="edit-asset-hero">

                <div className="edit-asset-hero-main">

                    <div className="edit-asset-device-icon">
                        <Laptop
                            size={27}
                        />
                    </div>

                    <div>

                        <div className="edit-asset-eyebrow">
                            ASSET CONTROL
                        </div>

                        <h1>
                            Edit Asset
                        </h1>

                        <p>
                            Update device
                            information,
                            ownership and
                            lifecycle status.
                        </p>

                    </div>

                </div>

                <div className="edit-asset-identity">

                    <span>
                        ASSET TAG
                    </span>

                    <strong>
                        {assetTag ||
                            "—"}
                    </strong>

                    <div
                        className={`edit-asset-status edit-asset-status-${status.toLowerCase()}`}
                    >
                        <span />

                        {
                            statusLabels[
                            status
                            ]
                        }
                    </div>

                </div>

            </section>

            {error && (
                <div className="edit-asset-alert">

                    <XCircle
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            <form
                className="edit-asset-form"
                onSubmit={
                    handleSubmit
                }
            >

                <div className="edit-asset-layout">

                    {/* ================================================
              LEFT — MAIN DATA
              ================================================ */}

                    <div className="edit-asset-main-column">

                        {/* DEVICE INFORMATION */}

                        <section className="edit-asset-card">

                            <div className="edit-asset-card-header">

                                <div className="edit-asset-card-icon">
                                    <HardDrive
                                        size={18}
                                    />
                                </div>

                                <div>

                                    <span>
                                        DEVICE PROFILE
                                    </span>

                                    <h2>
                                        Asset Information
                                    </h2>

                                    <p>
                                        Core identification
                                        and hardware details.
                                    </p>

                                </div>

                            </div>

                            <div className="edit-asset-fields">

                                {/* TAG */}

                                <div className="edit-asset-field">

                                    <label
                                        htmlFor="edit-asset-tag"
                                    >
                                        Asset Tag
                                        <b>*</b>
                                    </label>

                                    <div className="edit-asset-input">

                                        <Tag
                                            size={16}
                                        />

                                        <input
                                            id="edit-asset-tag"
                                            type="text"
                                            value={
                                                assetTag
                                            }
                                            disabled={
                                                saving
                                            }
                                            required
                                            onChange={(
                                                event
                                            ) =>
                                                setAssetTag(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                {/* TYPE */}

                                <div className="edit-asset-field">

                                    <label
                                        htmlFor="edit-asset-type"
                                    >
                                        Asset Type
                                        <b>*</b>
                                    </label>

                                    <div className="edit-asset-input">

                                        <Laptop
                                            size={16}
                                        />

                                        <input
                                            id="edit-asset-type"
                                            type="text"
                                            value={
                                                type
                                            }
                                            disabled={
                                                saving
                                            }
                                            required
                                            onChange={(
                                                event
                                            ) =>
                                                setType(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                {/* BRAND */}

                                <div className="edit-asset-field">

                                    <label
                                        htmlFor="edit-asset-brand"
                                    >
                                        Brand
                                    </label>

                                    <div className="edit-asset-input">

                                        <PackageCheck
                                            size={16}
                                        />

                                        <input
                                            id="edit-asset-brand"
                                            type="text"
                                            value={
                                                brand
                                            }
                                            placeholder="e.g. Dell"
                                            disabled={
                                                saving
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setBrand(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                {/* MODEL */}

                                <div className="edit-asset-field">

                                    <label
                                        htmlFor="edit-asset-model"
                                    >
                                        Model
                                    </label>

                                    <div className="edit-asset-input">

                                        <HardDrive
                                            size={16}
                                        />

                                        <input
                                            id="edit-asset-model"
                                            type="text"
                                            value={
                                                model
                                            }
                                            placeholder="e.g. Latitude 5540"
                                            disabled={
                                                saving
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setModel(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                {/* SERIAL */}

                                <div className="edit-asset-field edit-asset-field-wide">

                                    <label
                                        htmlFor="edit-asset-serial"
                                    >
                                        Serial Number
                                    </label>

                                    <div className="edit-asset-input">

                                        <Hash
                                            size={16}
                                        />

                                        <input
                                            id="edit-asset-serial"
                                            type="text"
                                            value={
                                                serialNumber
                                            }
                                            placeholder="Manufacturer serial number"
                                            disabled={
                                                saving
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSerialNumber(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* PURCHASE */}

                        <section className="edit-asset-card">

                            <div className="edit-asset-card-header">

                                <div className="edit-asset-card-icon edit-asset-card-icon-pink">
                                    <CalendarDays
                                        size={18}
                                    />
                                </div>

                                <div>

                                    <span>
                                        LIFECYCLE
                                    </span>

                                    <h2>
                                        Purchase & Warranty
                                    </h2>

                                    <p>
                                        Track acquisition and
                                        warranty coverage.
                                    </p>

                                </div>

                            </div>

                            <div className="edit-asset-fields">

                                <div className="edit-asset-field">

                                    <label
                                        htmlFor="edit-purchase-date"
                                    >
                                        Purchase Date
                                    </label>

                                    <div className="edit-asset-input">

                                        <CalendarDays
                                            size={16}
                                        />

                                        <input
                                            id="edit-purchase-date"
                                            type="date"
                                            value={
                                                purchaseDate
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setPurchaseDate(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                <div className="edit-asset-field">

                                    <label
                                        htmlFor="edit-warranty-expiry"
                                    >
                                        Warranty Expiry
                                    </label>

                                    <div className="edit-asset-input">

                                        <ShieldCheck
                                            size={16}
                                        />

                                        <input
                                            id="edit-warranty-expiry"
                                            type="date"
                                            value={
                                                warrantyExpiry
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setWarrantyExpiry(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                        </section>

                    </div>

                    {/* ================================================
              RIGHT — CONTROL PANEL
              ================================================ */}

                    <aside className="edit-asset-side-column">

                        <section className="edit-asset-control-card">

                            <div className="edit-asset-control-heading">

                                <div className="edit-asset-control-icon">
                                    <Wrench
                                        size={18}
                                    />
                                </div>

                                <div>

                                    <span>
                                        ASSET CONTROL
                                    </span>

                                    <h2>
                                        Assignment
                                    </h2>

                                </div>

                            </div>

                            {/* STATUS */}

                            <div className="edit-asset-side-field">

                                <label
                                    htmlFor="edit-asset-status"
                                >
                                    Lifecycle Status
                                </label>

                                <div className="edit-asset-select">

                                    <CheckCircle2
                                        size={16}
                                    />

                                    <select
                                        id="edit-asset-status"
                                        value={
                                            status
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatus(
                                                event
                                                    .target
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

                            </div>

                            {/* USER */}

                            <div className="edit-asset-side-field">

                                <label
                                    htmlFor="edit-assigned-user"
                                >
                                    Assigned User
                                </label>

                                <div className="edit-asset-select">

                                    <UserRound
                                        size={16}
                                    />

                                    <select
                                        id="edit-assigned-user"
                                        value={
                                            assignedUserId
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setAssignedUserId(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Unassigned
                                        </option>

                                        {users
                                            .filter(
                                                (
                                                    user
                                                ) =>
                                                    user.isActive !==
                                                    false
                                            )
                                            .map(
                                                (
                                                    user
                                                ) => (
                                                    <option
                                                        key={
                                                            user.id
                                                        }
                                                        value={
                                                            user.id
                                                        }
                                                    >
                                                        {
                                                            user.fullName
                                                        }{" "}
                                                        (
                                                        {
                                                            user.email
                                                        }
                                                        )
                                                    </option>
                                                )
                                            )}

                                    </select>

                                </div>

                            </div>

                            {/* DEPARTMENT */}

                            <div className="edit-asset-side-field">

                                <label
                                    htmlFor="edit-department"
                                >
                                    Department
                                </label>

                                <div className="edit-asset-select">

                                    <Building2
                                        size={16}
                                    />

                                    <select
                                        id="edit-department"
                                        value={
                                            departmentId
                                        }
                                        disabled={
                                            saving
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDepartmentId(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="">
                                            No Department
                                        </option>

                                        {departments.map(
                                            (
                                                department
                                            ) => (
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

                            </div>

                            {/* CURRENT SUMMARY */}

                            <div className="edit-asset-summary">

                                <div className="edit-asset-summary-top">

                                    <CircleUserRound
                                        size={17}
                                    />

                                    Current Assignment
                                </div>

                                <div className="edit-asset-summary-row">

                                    <span>
                                        User
                                    </span>

                                    <strong>
                                        {assignedUserId
                                            ? users.find(
                                                (
                                                    user
                                                ) =>
                                                    user.id ===
                                                    Number(
                                                        assignedUserId
                                                    )
                                            )
                                                ?.fullName ??
                                            "Assigned"
                                            : "Unassigned"}
                                    </strong>

                                </div>

                                <div className="edit-asset-summary-row">

                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {departmentId
                                            ? departments.find(
                                                (
                                                    department
                                                ) =>
                                                    department.id ===
                                                    Number(
                                                        departmentId
                                                    )
                                            )
                                                ?.name ??
                                            "Assigned"
                                            : "None"}
                                    </strong>

                                </div>

                            </div>

                        </section>

                    </aside>

                </div>

                {/* ================================================
            ACTION BAR
            ================================================ */}

                <div className="edit-asset-actions">

                    <div className="edit-asset-actions-copy">

                        <ShieldCheck
                            size={17}
                        />

                        <div>
                            <strong>
                                Asset changes
                            </strong>

                            <span>
                                Review ownership and
                                lifecycle status before
                                saving.
                            </span>
                        </div>

                    </div>

                    <div className="edit-asset-action-buttons">

                        <button
                            type="button"
                            className="edit-asset-cancel"
                            disabled={
                                saving
                            }
                            onClick={() =>
                                navigate(
                                    "/assets"
                                )
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-asset-save"
                            disabled={
                                saving
                            }
                        >
                            {saving ? (
                                <>
                                    <span className="edit-asset-spinner" />

                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save
                                        size={16}
                                    />

                                    Save Changes
                                </>
                            )}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}