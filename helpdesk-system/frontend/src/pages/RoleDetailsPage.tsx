import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Fingerprint,
    Globe2,
    KeyRound,
    Search,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";

import {
    getRole,
} from "../api/roles.api";

import "../styles/RoleDetailsPage.css";

interface Permission {
    id: number;
    name: string;
    code: string;
}

interface RolePermission {
    id?: number;
    permissionId?: number;
    permission: Permission;
}

interface Role {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    organizationId?: number | null;

    permissions?: RolePermission[];

    _count?: {
        users?: number;
        permissions?: number;
    };
}

export default function RoleDetailsPage() {
    const {
        id,
    } =
        useParams();

    const roleId =
        Number(id);

    const [
        role,
        setRole,
    ] =
        useState<Role | null>(
            null
        );

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

    /* =========================================================
       LOAD ROLE
       ========================================================= */

    useEffect(() => {
        const fetchRole =
            async () => {
                if (
                    !Number.isFinite(
                        roleId
                    )
                ) {
                    setError(
                        "Invalid role ID"
                    );

                    setLoading(false);

                    return;
                }

                try {
                    setError("");

                    const response =
                        await getRole(
                            roleId
                        );

                    const roleData =
                        response.data?.data
                            ?.role ??
                        response.data?.data;

                    setRole(
                        roleData
                    );
                } catch (
                error: any
                ) {
                    setError(
                        error.response?.data
                            ?.message ??
                        "Failed to load role"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void fetchRole();
    }, [
        roleId,
    ]);

    /* =========================================================
       FILTER PERMISSIONS
       ========================================================= */

    const filteredPermissions =
        useMemo(() => {
            if (
                !role?.permissions
            ) {
                return [];
            }

            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return role.permissions;
            }

            return role.permissions.filter(
                (item) =>
                    item.permission.name
                        .toLowerCase()
                        .includes(query) ||
                    item.permission.code
                        .toLowerCase()
                        .includes(query)
            );
        }, [
            role,
            search,
        ]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="role-details-loading">

                <div className="role-details-loading-icon">
                    <ShieldCheck
                        size={25}
                    />
                </div>

                <strong>
                    Loading role
                </strong>

                <p>
                    Retrieving access
                    configuration...
                </p>

            </div>
        );
    }

    /* =========================================================
       NOT FOUND
       ========================================================= */

    if (!role) {
        return (
            <div className="role-details-not-found">

                <div className="role-details-not-found-icon">
                    <ShieldCheck
                        size={26}
                    />
                </div>

                <h2>
                    Role unavailable
                </h2>

                <p>
                    {error ||
                        "Role not found."}
                </p>

                <Link
                    to="/roles"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Back to Roles
                </Link>

            </div>
        );
    }

    const permissionCount =
        role.permissions?.length ??
        role._count?.permissions ??
        0;

    const userCount =
        role._count?.users ??
        0;

    const scope =
        role.organizationId
            ? "Organization"
            : "Global";

    return (
        <div className="role-details-page">

            {/* =====================================================
          BACK
          ===================================================== */}

            <div className="role-details-topbar">

                <Link
                    to="/roles"
                    className="role-details-back"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Roles
                </Link>

                <span>
                    RBAC / ROLE DETAILS
                </span>

            </div>

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="role-details-hero">

                <div className="role-details-hero-main">

                    <div className="role-details-hero-icon">
                        <ShieldCheck
                            size={27}
                        />
                    </div>

                    <div>

                        <div className="role-details-eyebrow">
                            <span />

                            ACCESS CONTROL ROLE
                        </div>

                        <h1>
                            {role.name}
                        </h1>

                        <p>
                            {role.description ||
                                "No description has been provided for this role."}
                        </p>

                        <div className="role-details-hero-badges">

                            <span className="role-details-code-badge">
                                <Fingerprint
                                    size={13}
                                />

                                {role.code}
                            </span>

                            <span className="role-details-scope-badge">

                                {role.organizationId ? (
                                    <Building2
                                        size={13}
                                    />
                                ) : (
                                    <Globe2
                                        size={13}
                                    />
                                )}

                                {scope} Scope

                            </span>

                        </div>

                    </div>

                </div>

                <div className="role-details-hero-metrics">

                    <article>

                        <div>
                            <UserRound
                                size={17}
                            />
                        </div>

                        <span>
                            Assigned Users
                        </span>

                        <strong>
                            {userCount}
                        </strong>

                    </article>

                    <article>

                        <div>
                            <KeyRound
                                size={17}
                            />
                        </div>

                        <span>
                            Permissions
                        </span>

                        <strong>
                            {permissionCount}
                        </strong>

                    </article>

                </div>

            </section>

            {/* =====================================================
          ERROR
          ===================================================== */}

            {error && (
                <div className="role-details-alert">

                    <X
                        size={15}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* =====================================================
          CONTENT GRID
          ===================================================== */}

            <section className="role-details-grid">

                {/* ===================================================
            ROLE INFO
            =================================================== */}

                <aside className="role-details-info-card">

                    <div className="role-details-card-header">

                        <div className="role-details-card-icon">
                            <ShieldCheck
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                ROLE PROFILE
                            </span>

                            <h2>
                                Role Information
                            </h2>

                            <p>
                                Core RBAC configuration
                                for this role.
                            </p>

                        </div>

                    </div>

                    <div className="role-details-info-list">

                        {/* ID */}

                        <div className="role-details-info-item">

                            <span>
                                Role ID
                            </span>

                            <strong>
                                ROLE-
                                {String(
                                    role.id
                                ).padStart(
                                    3,
                                    "0"
                                )}
                            </strong>

                        </div>

                        {/* CODE */}

                        <div className="role-details-info-item">

                            <span>
                                System Code
                            </span>

                            <strong className="role-details-system-code">
                                {role.code}
                            </strong>

                        </div>

                        {/* SCOPE */}

                        <div className="role-details-info-item">

                            <span>
                                Scope
                            </span>

                            <strong>
                                {scope}
                            </strong>

                        </div>

                        {/* USERS */}

                        <div className="role-details-info-item">

                            <span>
                                Assigned Users
                            </span>

                            <strong>
                                {userCount}
                            </strong>

                        </div>

                        {/* PERMISSIONS */}

                        <div className="role-details-info-item">

                            <span>
                                Permissions
                            </span>

                            <strong>
                                {permissionCount}
                            </strong>

                        </div>

                    </div>

                    <div className="role-details-security-note">

                        <Sparkles
                            size={15}
                        />

                        <div>

                            <strong>
                                Access configuration
                            </strong>

                            <p>
                                Permissions listed here
                                define capabilities associated
                                with this system role.
                            </p>

                        </div>

                    </div>

                </aside>

                {/* ===================================================
            PERMISSIONS
            =================================================== */}

                <article className="role-details-permissions-card">

                    <div className="role-details-permissions-header">

                        <div>

                            <span className="role-details-section-label">
                                AUTHORIZATION MATRIX
                            </span>

                            <h2>
                                Permissions
                            </h2>

                            <p>
                                Capabilities currently
                                attached to this role.
                            </p>

                        </div>

                        <div className="role-details-permission-count">
                            <KeyRound
                                size={14}
                            />

                            {permissionCount} assigned
                        </div>

                    </div>

                    {/* SEARCH */}

                    <div className="role-details-toolbar">

                        <div className="role-details-search">

                            <Search
                                size={15}
                            />

                            <input
                                type="search"
                                placeholder="Search permission or code..."
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
                                    aria-label="Clear permission search"
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

                        <div className="role-details-toolbar-state">

                            <CheckCircle2
                                size={14}
                            />

                            Current configuration
                        </div>

                    </div>

                    {/* EMPTY */}

                    {filteredPermissions.length ===
                        0 ? (
                        <div className="role-details-empty">

                            <div className="role-details-empty-icon">
                                <KeyRound
                                    size={24}
                                />
                            </div>

                            <strong>
                                {search
                                    ? "No matching permissions"
                                    : "No permissions assigned"}
                            </strong>

                            <p>
                                {search
                                    ? "Try searching with another permission name or code."
                                    : "This role currently has no permissions associated with it."}
                            </p>

                        </div>
                    ) : (
                        <div className="role-details-permission-list">

                            {filteredPermissions.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <article
                                        className="role-details-permission-item"
                                        key={
                                            item.permission.id
                                        }
                                    >

                                        <div className="role-details-permission-index">
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </div>

                                        <div className="role-details-permission-icon">
                                            <KeyRound
                                                size={16}
                                            />
                                        </div>

                                        <div className="role-details-permission-copy">

                                            <span>
                                                PERMISSION
                                            </span>

                                            <strong>
                                                {
                                                    item.permission
                                                        .name
                                                }
                                            </strong>

                                            <code>
                                                {
                                                    item.permission
                                                        .code
                                                }
                                            </code>

                                        </div>

                                        <span className="role-details-enabled-badge">
                                            <span />

                                            Assigned
                                        </span>

                                    </article>
                                )
                            )}

                        </div>
                    )}

                </article>

            </section>

        </div>
    );
}