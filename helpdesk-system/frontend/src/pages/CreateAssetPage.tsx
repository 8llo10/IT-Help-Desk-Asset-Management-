import {
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    Hash,
    Laptop,
    PackagePlus,
    Save,
    ShieldCheck,
    Tag,
    Wrench,
} from "lucide-react";

import api from "../api/client";

import "../styles/CreateAssetPage.css";

type AssetStatus =
    | "AVAILABLE"
    | "IN_USE"
    | "MAINTENANCE"
    | "RETIRED";

export default function CreateAssetPage() {
    const navigate =
        useNavigate();

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
    ] = useState("");

    const [status, setStatus] =
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

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (
        event: FormEvent
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

            await api.post(
                "/assets",
                {
                    assetTag:
                        assetTag.trim(),

                    type:
                        type.trim(),

                    ...(brand.trim()
                        ? {
                            brand:
                                brand.trim(),
                        }
                        : {}),

                    ...(model.trim()
                        ? {
                            model:
                                model.trim(),
                        }
                        : {}),

                    ...(serialNumber.trim()
                        ? {
                            serialNumber:
                                serialNumber.trim(),
                        }
                        : {}),

                    status,

                    ...(purchaseDate
                        ? {
                            purchaseDate,
                        }
                        : {}),

                    ...(warrantyExpiry
                        ? {
                            warrantyExpiry,
                        }
                        : {}),
                }
            );

            navigate(
                "/assets"
            );
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to create asset"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="create-asset-page">

            {/* BACK */}

            <button
                type="button"
                className="create-asset-back"
                onClick={() =>
                    navigate("/assets")
                }
                disabled={saving}
            >
                <ArrowLeft size={16} />

                Back to Assets
            </button>

            {/* HEADER */}

            <section className="create-asset-header">

                <div className="create-asset-header-copy">

                    <span className="create-asset-eyebrow">
                        ASSET MANAGEMENT
                    </span>

                    <h1>
                        Add New Asset
                    </h1>

                    <p>
                        Register a new IT device or
                        equipment in the WASL asset
                        inventory.
                    </p>

                </div>

                <div className="create-asset-header-icon">
                    <PackagePlus
                        size={30}
                        strokeWidth={1.7}
                    />
                </div>

            </section>

            {/* ERROR */}

            {error && (
                <div
                    className="create-asset-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* FORM */}

            <form
                className="create-asset-form-card"
                onSubmit={handleSubmit}
            >

                {/* BASIC INFORMATION */}

                <section className="create-asset-section">

                    <div className="create-asset-section-heading">

                        <div className="create-asset-section-icon">
                            <Laptop size={18} />
                        </div>

                        <div>
                            <span>
                                DEVICE DETAILS
                            </span>

                            <h2>
                                Basic Information
                            </h2>

                            <p>
                                Enter the main identifying
                                information for this asset.
                            </p>
                        </div>

                    </div>

                    <div className="create-asset-grid">

                        {/* ASSET TAG */}

                        <div className="create-asset-field">

                            <label htmlFor="asset-tag">
                                Asset Tag
                                <span>*</span>
                            </label>

                            <div className="create-asset-input">

                                <Tag size={16} />

                                <input
                                    id="asset-tag"
                                    type="text"
                                    value={assetTag}
                                    placeholder="LT-0001"
                                    disabled={saving}
                                    required
                                    onChange={(event) =>
                                        setAssetTag(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                            <small>
                                Unique internal identifier.
                            </small>

                        </div>

                        {/* TYPE */}

                        <div className="create-asset-field">

                            <label htmlFor="asset-type">
                                Asset Type
                                <span>*</span>
                            </label>

                            <div className="create-asset-input">

                                <Laptop size={16} />

                                <input
                                    id="asset-type"
                                    type="text"
                                    value={type}
                                    placeholder="Laptop"
                                    disabled={saving}
                                    required
                                    onChange={(event) =>
                                        setType(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                            <small>
                                Laptop, monitor, printer, etc.
                            </small>

                        </div>

                        {/* BRAND */}

                        <div className="create-asset-field">

                            <label htmlFor="asset-brand">
                                Brand
                            </label>

                            <div className="create-asset-input">

                                <Wrench size={16} />

                                <input
                                    id="asset-brand"
                                    type="text"
                                    value={brand}
                                    placeholder="Dell"
                                    disabled={saving}
                                    onChange={(event) =>
                                        setBrand(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        {/* MODEL */}

                        <div className="create-asset-field">

                            <label htmlFor="asset-model">
                                Model
                            </label>

                            <div className="create-asset-input">

                                <Laptop size={16} />

                                <input
                                    id="asset-model"
                                    type="text"
                                    value={model}
                                    placeholder="Latitude 5540"
                                    disabled={saving}
                                    onChange={(event) =>
                                        setModel(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        {/* SERIAL NUMBER */}

                        <div className="create-asset-field">

                            <label htmlFor="asset-serial">
                                Serial Number
                            </label>

                            <div className="create-asset-input">

                                <Hash size={16} />

                                <input
                                    id="asset-serial"
                                    type="text"
                                    value={serialNumber}
                                    placeholder="SN123456"
                                    disabled={saving}
                                    onChange={(event) =>
                                        setSerialNumber(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        {/* STATUS */}

                        <div className="create-asset-field">

                            <label htmlFor="asset-status">
                                Status
                            </label>

                            <div className="create-asset-select">

                                <ShieldCheck size={16} />

                                <select
                                    id="asset-status"
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

                        </div>

                    </div>

                </section>

                {/* DATES */}

                <section className="create-asset-section">

                    <div className="create-asset-section-heading">

                        <div className="create-asset-section-icon secondary">
                            <CalendarDays size={18} />
                        </div>

                        <div>
                            <span>
                                LIFECYCLE
                            </span>

                            <h2>
                                Purchase & Warranty
                            </h2>

                            <p>
                                Optional lifecycle information
                                for tracking the asset.
                            </p>
                        </div>

                    </div>

                    <div className="create-asset-grid dates">

                        <div className="create-asset-field">

                            <label htmlFor="purchase-date">
                                Purchase Date
                            </label>

                            <div className="create-asset-input">

                                <CalendarDays size={16} />

                                <input
                                    id="purchase-date"
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

                        </div>

                        <div className="create-asset-field">

                            <label htmlFor="warranty-expiry">
                                Warranty Expiry
                            </label>

                            <div className="create-asset-input">

                                <ShieldCheck size={16} />

                                <input
                                    id="warranty-expiry"
                                    type="date"
                                    value={warrantyExpiry}
                                    disabled={saving}
                                    onChange={(event) =>
                                        setWarrantyExpiry(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </section>

                {/* ACTIONS */}

                <div className="create-asset-actions">

                    <button
                        type="button"
                        className="create-asset-cancel"
                        disabled={saving}
                        onClick={() =>
                            navigate("/assets")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="create-asset-submit"
                        disabled={
                            saving ||
                            !assetTag.trim() ||
                            !type.trim()
                        }
                    >
                        {saving ? (
                            <>
                                <span className="create-asset-spinner" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Add Asset
                            </>
                        )}
                    </button>

                </div>

            </form>

        </div>
    );
}