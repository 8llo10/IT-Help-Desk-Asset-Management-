import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    Building2,
    CheckCircle2,
    CircleDot,
    DoorOpen,
    Layers3,
    MapPinned,
    MapPinPlus,
    Plus,
    Search,
    Sparkles,
    X,
} from "lucide-react";

import api from "../api/client";

import "../styles/LocationsPage.css";

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
    const [
        locations,
        setLocations,
    ] =
        useState<Location[]>([]);

    const [
        branches,
        setBranches,
    ] =
        useState<Branch[]>([]);

    const [
        name,
        setName,
    ] =
        useState("");

    const [
        branchId,
        setBranchId,
    ] =
        useState("");

    const [
        search,
        setSearch,
    ] =
        useState("");

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        saving,
        setSaving,
    ] =
        useState(false);

    const [
        error,
        setError,
    ] =
        useState("");

    const [
        message,
        setMessage,
    ] =
        useState("");

    /* =========================================================
       LOAD
       ========================================================= */

    const fetchData =
        async () => {
            try {
                setError("");

                const [
                    locationsResponse,
                    branchesResponse,
                ] =
                    await Promise.all([
                        api.get(
                            "/locations"
                        ),
                        api.get(
                            "/branches"
                        ),
                    ]);

                const locationsData =
                    locationsResponse.data
                        ?.data?.locations ??
                    locationsResponse.data
                        ?.data ??
                    [];

                const branchesData =
                    branchesResponse.data
                        ?.data?.branches ??
                    branchesResponse.data
                        ?.data ??
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
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to load locations"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchData();
    }, []);

    /* =========================================================
       CREATE
       ========================================================= */

    const handleSubmit =
        async (
            event: FormEvent
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
                            Number(
                                branchId
                            ),
                    }
                );

                setName("");
                setBranchId("");

                setMessage(
                    "Location created successfully."
                );

                await fetchData();
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to create location"
                );
            } finally {
                setSaving(false);
            }
        };

    /* =========================================================
       SEARCH
       ========================================================= */

    const filteredLocations =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return locations;
            }

            return locations.filter(
                (location) => {
                    const branchName =
                        location.branch?.name ??
                        branches.find(
                            (branch) =>
                                branch.id ===
                                location.branchId
                        )?.name ??
                        "";

                    return (
                        location.name
                            .toLowerCase()
                            .includes(query) ||
                        branchName
                            .toLowerCase()
                            .includes(query) ||
                        location.floor
                            ?.toLowerCase()
                            .includes(query) ||
                        location.room
                            ?.toLowerCase()
                            .includes(query) ||
                        String(
                            location.id
                        ).includes(query)
                    );
                }
            );
        }, [
            locations,
            branches,
            search,
        ]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="locations-loading">

                <div className="locations-loader-icon">
                    <MapPinned
                        size={25}
                    />
                </div>

                <strong>
                    Loading locations
                </strong>

                <p>
                    Preparing physical site
                    directory...
                </p>

            </div>
        );
    }

    /* =========================================================
       UI
       ========================================================= */

    return (
        <div className="locations-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="locations-hero">

                <div className="locations-hero-copy">

                    <div className="locations-eyebrow">
                        <span />
                        PHYSICAL INFRASTRUCTURE
                    </div>

                    <h1>
                        Locations
                    </h1>

                    <p>
                        Manage offices, rooms,
                        operational areas and other
                        physical work locations across
                        company branches.
                    </p>

                </div>

                <div className="locations-hero-stats">

                    <div className="locations-hero-stat">

                        <div className="locations-hero-stat-icon">
                            <MapPinned
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Locations
                            </span>

                            <strong>
                                {
                                    locations.length
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="locations-hero-stat">

                        <div className="locations-hero-stat-icon locations-hero-stat-icon-pink">
                            <Building2
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Branches
                            </span>

                            <strong>
                                {
                                    branches.length
                                }
                            </strong>
                        </div>

                    </div>

                </div>

            </section>

            {/* =====================================================
          ALERTS
          ===================================================== */}

            {error && (
                <div className="locations-alert locations-alert-error">

                    <X size={16} />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {message && (
                <div className="locations-alert locations-alert-success">

                    <CheckCircle2
                        size={16}
                    />

                    <span>
                        {message}
                    </span>

                </div>
            )}

            {/* =====================================================
          WORKSPACE
          ===================================================== */}

            <section className="locations-workspace">

                {/* ===================================================
            CREATE CARD
            =================================================== */}

                <article className="locations-create-card">

                    <div className="locations-card-heading">

                        <div className="locations-heading-icon">
                            <MapPinPlus
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                NEW LOCATION
                            </span>

                            <h2>
                                Add Work Location
                            </h2>

                            <p>
                                Register a physical
                                workplace under an
                                existing branch.
                            </p>

                        </div>

                    </div>

                    <form
                        className="locations-create-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* BRANCH */}

                        <div className="locations-field">

                            <label
                                htmlFor="location-branch"
                            >
                                Branch
                                <b>*</b>
                            </label>

                            <div className="locations-select-shell">

                                <Building2
                                    size={16}
                                />

                                <select
                                    id="location-branch"
                                    value={
                                        branchId
                                    }
                                    disabled={
                                        saving
                                    }
                                    required
                                    onChange={(
                                        event
                                    ) =>
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

                        </div>

                        {/* NAME */}

                        <div className="locations-field">

                            <label
                                htmlFor="location-name"
                            >
                                Location Name
                                <b>*</b>
                            </label>

                            <div className="locations-input-shell">

                                <MapPinned
                                    size={16}
                                />

                                <input
                                    id="location-name"
                                    type="text"
                                    value={
                                        name
                                    }
                                    placeholder="e.g. IT Office - Floor 2"
                                    disabled={
                                        saving
                                    }
                                    required
                                    onChange={(
                                        event
                                    ) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="locations-create-button"
                            disabled={
                                saving ||
                                !name.trim() ||
                                !branchId
                            }
                        >
                            {saving ? (
                                <>
                                    <span className="locations-button-spinner" />

                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus
                                        size={16}
                                    />

                                    Add Location
                                </>
                            )}
                        </button>

                    </form>

                    <div className="locations-create-note">

                        <Sparkles
                            size={15}
                        />

                        <span>
                            Locations help associate
                            tickets, assets and IT
                            operations with a physical
                            workplace.
                        </span>

                    </div>

                </article>

                {/* ===================================================
            DIRECTORY
            =================================================== */}

                <article className="locations-directory">

                    <div className="locations-directory-header">

                        <div>

                            <span className="locations-section-eyebrow">
                                SITE DIRECTORY
                            </span>

                            <h2>
                                Physical Locations
                            </h2>

                            <p>
                                Browse company workspaces
                                and their assigned branches.
                            </p>

                        </div>

                        <div className="locations-count-chip">
                            {locations.length}
                            {" "}
                            locations
                        </div>

                    </div>

                    {/* TOOLBAR */}

                    <div className="locations-toolbar">

                        <div className="locations-search">

                            <Search
                                size={16}
                            />

                            <input
                                type="search"
                                placeholder="Search location or branch..."
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                            {search && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    <X
                                        size={14}
                                    />
                                </button>
                            )}

                        </div>

                        <div className="locations-toolbar-label">

                            <Layers3
                                size={15}
                            />

                            Physical Sites
                        </div>

                    </div>

                    {/* EMPTY */}

                    {filteredLocations.length ===
                        0 ? (
                        <div className="locations-empty">

                            <div className="locations-empty-icon">
                                <MapPinned
                                    size={25}
                                />
                            </div>

                            <strong>
                                {search
                                    ? "No matching locations"
                                    : "No locations yet"}
                            </strong>

                            <p>
                                {search
                                    ? "Try another location or branch name."
                                    : "Create the first workplace using the form."}
                            </p>

                        </div>
                    ) : (
                        <div className="locations-table-wrap">

                            <table className="locations-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Location
                                        </th>

                                        <th>
                                            Branch
                                        </th>

                                        <th>
                                            Floor / Room
                                        </th>

                                        <th>
                                            Location ID
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredLocations.map(
                                        (location) => {
                                            const branchName =
                                                location.branch
                                                    ?.name ??
                                                branches.find(
                                                    (branch) =>
                                                        branch.id ===
                                                        location.branchId
                                                )?.name ??
                                                "—";

                                            return (
                                                <tr
                                                    key={
                                                        location.id
                                                    }
                                                >

                                                    {/* LOCATION */}

                                                    <td>

                                                        <div className="locations-name-cell">

                                                            <div className="locations-row-icon">
                                                                <MapPinned
                                                                    size={17}
                                                                />
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        location.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    Physical workplace
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* BRANCH */}

                                                    <td>

                                                        <div className="locations-branch-cell">

                                                            <Building2
                                                                size={14}
                                                            />

                                                            <span>
                                                                {
                                                                    branchName
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* FLOOR / ROOM */}

                                                    <td>

                                                        <div className="locations-floor-room">

                                                            {location.floor ? (
                                                                <span>

                                                                    <Layers3
                                                                        size={13}
                                                                    />

                                                                    {
                                                                        location.floor
                                                                    }

                                                                </span>
                                                            ) : null}

                                                            {location.room ? (
                                                                <span>

                                                                    <DoorOpen
                                                                        size={13}
                                                                    />

                                                                    {
                                                                        location.room
                                                                    }

                                                                </span>
                                                            ) : null}

                                                            {!location.floor &&
                                                                !location.room && (
                                                                    <span className="locations-empty-detail">
                                                                        —
                                                                    </span>
                                                                )}

                                                        </div>

                                                    </td>

                                                    {/* ID */}

                                                    <td>

                                                        <span className="locations-id">
                                                            LOC-
                                                            {String(
                                                                location.id
                                                            ).padStart(
                                                                3,
                                                                "0"
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`locations-status ${location.isActive ===
                                                                false
                                                                ? "inactive"
                                                                : "active"
                                                                }`}
                                                        >
                                                            <span />

                                                            {location.isActive ===
                                                                false
                                                                ? "Inactive"
                                                                : "Active"}
                                                        </span>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </article>

            </section>

        </div>
    );
}