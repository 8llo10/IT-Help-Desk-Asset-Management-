import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function CreateAssetPage() {
    const navigate = useNavigate();

    const [assetTag, setAssetTag] = useState("");
    const [type, setType] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [serialNumber, setSerialNumber] = useState("");

    const [status, setStatus] = useState("AVAILABLE");

    const [purchaseDate, setPurchaseDate] = useState("");
    const [warrantyExpiry, setWarrantyExpiry] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await api.post("/assets", {
                assetTag: assetTag.trim(),
                type: type.trim(),

                ...(brand.trim() && {
                    brand: brand.trim(),
                }),

                ...(model.trim() && {
                    model: model.trim(),
                }),

                ...(serialNumber.trim() && {
                    serialNumber: serialNumber.trim(),
                }),

                status,

                ...(purchaseDate && {
                    purchaseDate,
                }),

                ...(warrantyExpiry && {
                    warrantyExpiry,
                }),
            });

            navigate("/assets");
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to create asset"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Add Asset</h1>

            <p>Add a new IT asset to the system.</p>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Asset Tag</label>

                    <input
                        type="text"
                        value={assetTag}
                        onChange={(e) =>
                            setAssetTag(e.target.value)
                        }
                        placeholder="LAP-001"
                        required
                    />
                </div>

                <div>
                    <label>Type</label>

                    <input
                        type="text"
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value)
                        }
                        placeholder="Laptop"
                        required
                    />
                </div>

                <div>
                    <label>Brand</label>

                    <input
                        type="text"
                        value={brand}
                        onChange={(e) =>
                            setBrand(e.target.value)
                        }
                        placeholder="Dell"
                    />
                </div>

                <div>
                    <label>Model</label>

                    <input
                        type="text"
                        value={model}
                        onChange={(e) =>
                            setModel(e.target.value)
                        }
                        placeholder="Latitude 5540"
                    />
                </div>

                <div>
                    <label>Serial Number</label>

                    <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) =>
                            setSerialNumber(e.target.value)
                        }
                        placeholder="SN123456"
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
                    <label>Purchase Date</label>

                    <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) =>
                            setPurchaseDate(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Warranty Expiry</label>

                    <input
                        type="date"
                        value={warrantyExpiry}
                        onChange={(e) =>
                            setWarrantyExpiry(e.target.value)
                        }
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating..."
                        : "Add Asset"}
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