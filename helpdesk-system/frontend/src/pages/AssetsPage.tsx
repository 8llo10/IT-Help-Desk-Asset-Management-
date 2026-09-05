import "../styles/AssetsPage.css";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    Boxes,
    CircleCheck,
    CircleDot,
    HardDrive,
    Laptop,
    Plus,
    Search,
    Settings2,
    Wrench,
} from "lucide-react";

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

const formatStatus = (
    status: AssetStatus
) => {
    switch (status) {
        case "AVAILABLE":
            return "Available";

        case "IN_USE":
            return "In Use";

        case "MAINTENANCE":
            return "Maintenance";

        case "RETIRED":
            return "Retired";

        default:
            return status;
    }
};

export default function AssetsPage() {
    const {
        user,
    } = useAuth();

    const [
        assets,
        setAssets,
    ] =
        useState<Asset[]>([]);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        error,
        setError,
    ] =
        useState("");

    const [
        search,
        setSearch,
    ] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState("");

    /* =========================================================
       FETCH
       ========================================================= */

    const fetchAssets = async () => {
        try {
            setError("");

            const response =
                await api.get(
                    "/assets"
                );

            const data =
                response.data?.data
                    ?.assets ??
                response.data?.data ??
                [];

            setAssets(
                Array.isArray(
                    data
                )
                    ? data
                    : []
            );
        } catch (
        error: any
        ) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to load assets"
            );
        } finally {
            setLoading(
                false
            );
        }
    };

    useEffect(() => {
        void fetchAssets();
    }, []);

    /* =========================================================
       FILTER
       ========================================================= */

    const filteredAssets =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return assets.filter(
                (asset) => {
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
                }
            );
        }, [
            assets,
            search,
            statusFilter,
        ]);

    /* =========================================================
       STATS
       ========================================================= */

    const statistics =
        useMemo(() => {
            return {
                total:
                    assets.length,

                available:
                    assets.filter(
                        (asset) =>
                            asset.status ===
                            "AVAILABLE"
                    ).length,

                inUse:
                    assets.filter(
                        (asset) =>
                            asset.status ===
                            "IN_USE"
                    ).length,

                maintenance:
                    assets.filter(
                        (asset) =>
                            asset.status ===
                            "MAINTENANCE"
                    ).length,
            };
        }, [
            assets,
        ]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="assets-loading">

                <div className="assets-loading-spinner" />

                <p>
                    Loading assets...
                </p>

            </div>
        );
    }

    /* =========================================================
       UI
       ========================================================= */

    return (
        <div className="assets-page">

            {/* =====================================================
          HEADER
          ===================================================== */}

            <section className="assets-header">

                <div className="assets-header-copy">

                    <span className="assets-eyebrow">
                        ASSET MANAGEMENT
                    </span>

                    <h1>
                        IT Assets
                    </h1>

                    <p>
                        Manage company devices,
                        ownership, availability
                        and maintenance status.
                    </p>

                </div>

                {user?.role ===
                    "ADMIN" && (
                        <Link
                            to="/assets/new"
                            className="assets-add-button"
                        >
                            <Plus
                                size={18}
                            />

                            Add Asset
                        </Link>
                    )}

            </section>

            {/* =====================================================
          STATS
          ===================================================== */}

            <section className="assets-stats">

                <article className="asset-stat-card">

                    <div className="asset-stat-icon">
                        <Boxes
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Total Assets
                        </span>

                        <strong>
                            {statistics.total}
                        </strong>

                        <p>
                            Registered devices
                        </p>
                    </div>

                </article>

                <article className="asset-stat-card">

                    <div className="asset-stat-icon available">
                        <CircleCheck
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Available
                        </span>

                        <strong>
                            {statistics.available}
                        </strong>

                        <p>
                            Ready for assignment
                        </p>
                    </div>

                </article>

                <article className="asset-stat-card">

                    <div className="asset-stat-icon in-use">
                        <Laptop
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            In Use
                        </span>

                        <strong>
                            {statistics.inUse}
                        </strong>

                        <p>
                            Assigned assets
                        </p>
                    </div>

                </article>

                <article className="asset-stat-card">

                    <div className="asset-stat-icon maintenance">
                        <Wrench
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Maintenance
                        </span>

                        <strong>
                            {statistics.maintenance}
                        </strong>

                        <p>
                            Needs attention
                        </p>
                    </div>

                </article>

            </section>

            {/* =====================================================
          FILTERS
          ===================================================== */}

            <section className="assets-toolbar">

                <div className="assets-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="search"
                        placeholder="Search by asset tag, type, brand, model or employee..."
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target
                                    .value
                            )
                        }
                    />

                </div>

                <div className="assets-filter">

                    <Settings2
                        size={17}
                    />

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event.target
                                    .value
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

            </section>

            {/* =====================================================
          ERROR
          ===================================================== */}

            {error && (
                <div
                    className="assets-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* =====================================================
          TABLE
          ===================================================== */}

            {filteredAssets.length ===
                0 ? (
                <section className="assets-empty">

                    <div className="assets-empty-icon">
                        <HardDrive
                            size={28}
                        />
                    </div>

                    <h2>
                        No assets found
                    </h2>

                    <p>
                        Try changing the search
                        query or status filter.
                    </p>

                </section>
            ) : (
                <section className="assets-table-card">

                    <div className="assets-table-heading">

                        <div>

                            <span>
                                INVENTORY
                            </span>

                            <h2>
                                Asset Directory
                            </h2>

                        </div>

                        <p>
                            Showing{" "}
                            <strong>
                                {filteredAssets.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {assets.length}
                            </strong>
                        </p>

                    </div>

                    <div className="assets-table-wrapper">

                        <table className="assets-table">

                            <thead>

                                <tr>

                                    <th>
                                        Asset
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Device
                                    </th>

                                    <th>
                                        Serial Number
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Assigned To
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    {user?.role ===
                                        "ADMIN" && (
                                            <th>
                                                Actions
                                            </th>
                                        )}

                                </tr>

                            </thead>

                            <tbody>

                                {filteredAssets.map(
                                    (asset) => (
                                        <tr
                                            key={
                                                asset.id
                                            }
                                        >

                                            <td>

                                                <div className="assets-device-main">

                                                    <div className="assets-device-icon">
                                                        <HardDrive
                                                            size={18}
                                                        />
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {asset.assetTag}
                                                        </strong>

                                                        <span>
                                                            Asset #{asset.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                {asset.type}
                                            </td>

                                            <td>

                                                <div className="assets-device-description">

                                                    <strong>
                                                        {asset.brand ??
                                                            "—"}
                                                    </strong>

                                                    <span>
                                                        {asset.model ??
                                                            "No model"}
                                                    </span>

                                                </div>

                                            </td>

                                            <td>

                                                <span className="assets-serial">
                                                    {asset.serialNumber ??
                                                        "—"}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`asset-status asset-status-${asset.status
                                                        .toLowerCase()
                                                        .replace(
                                                            "_",
                                                            "-"
                                                        )}`}
                                                >
                                                    <CircleDot
                                                        size={11}
                                                    />

                                                    {formatStatus(
                                                        asset.status
                                                    )}
                                                </span>

                                            </td>

                                            <td>

                                                {asset.assignedUser ? (
                                                    <div className="assets-assigned-user">

                                                        <div className="assets-user-avatar">

                                                            {asset.assignedUser
                                                                .fullName
                                                                .split(
                                                                    " "
                                                                )
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .map(
                                                                    (
                                                                        name
                                                                    ) =>
                                                                        name[0]
                                                                )
                                                                .slice(
                                                                    0,
                                                                    2
                                                                )
                                                                .join(
                                                                    ""
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    asset
                                                                        .assignedUser
                                                                        .fullName
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    asset
                                                                        .assignedUser
                                                                        .email
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>
                                                ) : (
                                                    <span className="assets-unassigned">
                                                        Unassigned
                                                    </span>
                                                )}

                                            </td>

                                            <td>

                                                {asset.department
                                                    ?.name ??
                                                    "—"}

                                            </td>

                                            {user?.role ===
                                                "ADMIN" && (
                                                    <td>

                                                        <Link
                                                            to={`/assets/${asset.id}/edit`}
                                                            className="assets-edit-button"
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

                    </div>

                </section>
            )}

        </div>
    );
}