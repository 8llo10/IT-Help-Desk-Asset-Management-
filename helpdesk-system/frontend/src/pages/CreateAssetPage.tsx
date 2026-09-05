import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import api from "../api/client";

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

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

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
                error.response?.data?.message ??
                "Failed to create asset"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h1>
                Add Asset
            </h1>

            <p>
                Add a new IT asset
                to WASL.
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

                <div>
                    <label>
                        Type
                    </label>

                    <input
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

                <div>
                    <label>
                        Brand
                    </label>

                    <input
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

                <div>
                    <label>
                        Model
                    </label>

                    <input
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

                <div>
                    <label>
                        Serial Number
                    </label>

                    <input
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
                    disabled={
                        saving ||
                        !assetTag.trim() ||
                        !type.trim()
                    }
                >
                    {saving
                        ? "Creating..."
                        : "Add Asset"}
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