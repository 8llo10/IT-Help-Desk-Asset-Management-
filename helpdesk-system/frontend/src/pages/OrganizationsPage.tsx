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
    Hash,
    Network,
    Plus,
    Search,
    Sparkles,
    X,
} from "lucide-react";

import api from "../api/client";

import "../styles/OrganizationsPage.css";

interface Organization {
    id: number;
    name: string;
    code?: string | null;
    isActive?: boolean;
}

export default function OrganizationsPage() {
    const [
        organizations,
        setOrganizations,
    ] =
        useState<Organization[]>([]);

    const [
        name,
        setName,
    ] =
        useState("");

    const [
        code,
        setCode,
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
       LOAD ORGANIZATIONS
       ========================================================= */

    const fetchOrganizations =
        async () => {
            try {
                setError("");

                const response =
                    await api.get(
                        "/organizations"
                    );

                const data =
                    response.data?.data
                        ?.organizations ??
                    response.data?.data ??
                    [];

                setOrganizations(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to load organizations"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchOrganizations();
    }, []);

    /* =========================================================
       CREATE
       ========================================================= */

    const handleSubmit =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();

            const trimmedName =
                name.trim();

            if (!trimmedName) {
                setError(
                    "Organization name is required."
                );

                return;
            }

            try {
                setSaving(true);

                setError("");
                setMessage("");

                await api.post(
                    "/organizations",
                    {
                        name:
                            trimmedName,

                        ...(code.trim()
                            ? {
                                code:
                                    code
                                        .trim()
                                        .toUpperCase(),
                            }
                            : {}),
                    }
                );

                setName("");
                setCode("");

                setMessage(
                    "Organization created successfully."
                );

                await fetchOrganizations();
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to create organization"
                );
            } finally {
                setSaving(false);
            }
        };

    /* =========================================================
       SEARCH
       ========================================================= */

    const filteredOrganizations =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return organizations;
            }

            return organizations.filter(
                (organization) =>
                    organization.name
                        .toLowerCase()
                        .includes(query) ||
                    organization.code
                        ?.toLowerCase()
                        .includes(query) ||
                    String(
                        organization.id
                    ).includes(query)
            );
        }, [
            organizations,
            search,
        ]);

    /* =========================================================
       COUNTS
       ========================================================= */

    const activeOrganizations =
        useMemo(() => {
            return organizations.filter(
                (organization) =>
                    organization.isActive !==
                    false
            ).length;
        }, [organizations]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="organizations-loading">

                <div className="organizations-loading-icon">
                    <Building2
                        size={25}
                    />
                </div>

                <strong>
                    Loading organizations
                </strong>

                <p>
                    Preparing organization
                    structure...
                </p>

            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="organizations-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="organizations-hero">

                <div className="organizations-hero-copy">

                    <div className="organizations-eyebrow">
                        <span />
                        ORGANIZATION STRUCTURE
                    </div>

                    <h1>
                        Organizations
                    </h1>

                    <p>
                        Manage top-level organizations
                        registered in WASL and maintain
                        the structure used by branches,
                        locations and IT operations.
                    </p>

                </div>

                <div className="organizations-hero-stats">

                    <div className="organizations-hero-stat">

                        <div className="organizations-hero-stat-icon">
                            <Building2
                                size={20}
                            />
                        </div>

                        <div>

                            <span>
                                Organizations
                            </span>

                            <strong>
                                {
                                    organizations.length
                                }
                            </strong>

                        </div>

                    </div>

                    <div className="organizations-hero-stat">

                        <div className="organizations-hero-stat-icon organizations-hero-stat-icon-green">
                            <CircleDot
                                size={20}
                            />
                        </div>

                        <div>

                            <span>
                                Active
                            </span>

                            <strong>
                                {
                                    activeOrganizations
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
                <div className="organizations-alert organizations-alert-error">

                    <X
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {message && (
                <div className="organizations-alert organizations-alert-success">

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

            <section className="organizations-workspace">

                {/* ===================================================
            CREATE
            =================================================== */}

                <article className="organizations-create-card">

                    <div className="organizations-card-heading">

                        <div className="organizations-heading-icon">
                            <Plus
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                NEW ORGANIZATION
                            </span>

                            <h2>
                                Register Organization
                            </h2>

                            <p>
                                Add a new top-level
                                organization to WASL.
                            </p>

                        </div>

                    </div>

                    <form
                        className="organizations-create-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* NAME */}

                        <div className="organizations-field">

                            <label
                                htmlFor="organization-name"
                            >
                                Organization Name
                                <b>*</b>
                            </label>

                            <div className="organizations-input-shell">

                                <Building2
                                    size={16}
                                />

                                <input
                                    id="organization-name"
                                    type="text"
                                    value={
                                        name
                                    }
                                    placeholder="e.g. WASL Company"
                                    disabled={
                                        saving
                                    }
                                    required
                                    onChange={(
                                        event
                                    ) => {
                                        setName(
                                            event.target.value
                                        );

                                        setError("");
                                        setMessage("");
                                    }}
                                />

                            </div>

                        </div>

                        {/* CODE */}

                        <div className="organizations-field">

                            <label
                                htmlFor="organization-code"
                            >
                                Organization Code
                            </label>

                            <div className="organizations-input-shell">

                                <Hash
                                    size={16}
                                />

                                <input
                                    id="organization-code"
                                    type="text"
                                    value={
                                        code
                                    }
                                    placeholder="e.g. WASL"
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setCode(
                                            event.target.value
                                        );

                                        setError("");
                                        setMessage("");
                                    }}
                                />

                            </div>

                            <small>
                                Optional. The code will be
                                stored in uppercase.
                            </small>

                        </div>

                        <button
                            type="submit"
                            className="organizations-create-button"
                            disabled={
                                saving ||
                                !name.trim()
                            }
                        >
                            {saving ? (
                                <>
                                    <span className="organizations-spinner" />

                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus
                                        size={16}
                                    />

                                    Add Organization
                                </>
                            )}
                        </button>

                    </form>

                    <div className="organizations-note">

                        <Sparkles
                            size={15}
                        />

                        <span>
                            Organizations form the top
                            layer of the WASL company
                            structure.
                        </span>

                    </div>

                </article>

                {/* ===================================================
            DIRECTORY
            =================================================== */}

                <article className="organizations-directory">

                    <div className="organizations-directory-header">

                        <div>

                            <span className="organizations-section-label">
                                ORGANIZATION DIRECTORY
                            </span>

                            <h2>
                                Registered Organizations
                            </h2>

                            <p>
                                Browse organizations currently
                                available in the system.
                            </p>

                        </div>

                        <div className="organizations-count-chip">
                            {
                                organizations.length
                            }{" "}
                            organizations
                        </div>

                    </div>

                    {/* TOOLBAR */}

                    <div className="organizations-toolbar">

                        <div className="organizations-search">

                            <Search
                                size={16}
                            />

                            <input
                                type="search"
                                value={
                                    search
                                }
                                placeholder="Search organization or code..."
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

                        <div className="organizations-toolbar-note">

                            <Network
                                size={15}
                            />

                            Top-level entities
                        </div>

                    </div>

                    {/* EMPTY */}

                    {filteredOrganizations.length ===
                        0 ? (
                        <div className="organizations-empty">

                            <div className="organizations-empty-icon">
                                <Building2
                                    size={25}
                                />
                            </div>

                            <strong>
                                {search
                                    ? "No matching organizations"
                                    : "No organizations yet"}
                            </strong>

                            <p>
                                {search
                                    ? "Try another organization name or code."
                                    : "Register the first organization using the form."}
                            </p>

                        </div>
                    ) : (
                        <div className="organizations-table-wrap">

                            <table className="organizations-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Organization
                                        </th>

                                        <th>
                                            Code
                                        </th>

                                        <th>
                                            Organization ID
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredOrganizations.map(
                                        (
                                            organization
                                        ) => (
                                            <tr
                                                key={
                                                    organization.id
                                                }
                                            >

                                                {/* ORGANIZATION */}

                                                <td>

                                                    <div className="organizations-name-cell">

                                                        <div className="organizations-row-icon">
                                                            <Building2
                                                                size={17}
                                                            />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    organization.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Organization
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* CODE */}

                                                <td>

                                                    {organization.code ? (
                                                        <span className="organizations-code">
                                                            {
                                                                organization.code
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="organizations-muted">
                                                            —
                                                        </span>
                                                    )}

                                                </td>

                                                {/* ID */}

                                                <td>

                                                    <span className="organizations-id">
                                                        ORG-
                                                        {String(
                                                            organization.id
                                                        ).padStart(
                                                            3,
                                                            "0"
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`organizations-status ${organization.isActive ===
                                                                false
                                                                ? "inactive"
                                                                : "active"
                                                            }`}
                                                    >
                                                        <span />

                                                        {organization.isActive ===
                                                            false
                                                            ? "Inactive"
                                                            : "Active"}
                                                    </span>

                                                </td>

                                            </tr>
                                        )
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