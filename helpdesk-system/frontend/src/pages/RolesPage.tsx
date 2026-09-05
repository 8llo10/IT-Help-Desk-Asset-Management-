import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    ArrowRight,
    Building2,
    Globe2,
    KeyRound,
    Search,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";

import {
    getRoles,
} from "../api/roles.api";

import "../styles/RolesPage.css";

interface Role {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    organizationId?: number | null;
    permissions?: unknown[];

    _count?: {
        users?: number;
        permissions?: number;
    };
}

export default function RolesPage() {
    const navigate =
        useNavigate();

    const [
        roles,
        setRoles,
    ] =
        useState<Role[]>([]);

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
        error,
        setError,
    ] =
        useState("");

    /* =========================================================
       LOAD ROLES
       ========================================================= */

    useEffect(() => {
        const fetchRoles =
            async () => {
                try {
                    setError("");

                    const response =
                        await getRoles();

                    const rolesData =
                        response.data?.data
                            ?.roles ??
                        response.data?.data ??
                        [];

                    setRoles(
                        Array.isArray(
                            rolesData
                        )
                            ? rolesData
                            : []
                    );
                } catch (
                error: any
                ) {
                    setError(
                        error.response?.data
                            ?.message ??
                        "Failed to load roles"
                    );
                } finally {
                    setLoading(false);
                }
            };

        void fetchRoles();
    }, []);

    /* =========================================================
       DERIVED DATA
       ========================================================= */

    const filteredRoles =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return roles;
            }

            return roles.filter(
                (role) =>
                    role.name
                        .toLowerCase()
                        .includes(query) ||
                    role.code
                        .toLowerCase()
                        .includes(query) ||
                    role.description
                        ?.toLowerCase()
                        .includes(query)
            );
        }, [
            roles,
            search,
        ]);

    const globalRoles =
        useMemo(() => {
            return roles.filter(
                (role) =>
                    !role.organizationId
            ).length;
        }, [roles]);

    const organizationRoles =
        roles.length -
        globalRoles;

    const totalAssignedUsers =
        useMemo(() => {
            return roles.reduce(
                (
                    total,
                    role
                ) =>
                    total +
                    (
                        role._count?.users ??
                        0
                    ),
                0
            );
        }, [roles]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="roles-loading">

                <div className="roles-loading-icon">
                    <ShieldCheck
                        size={25}
                    />
                </div>

                <strong>
                    Loading roles
                </strong>

                <p>
                    Preparing WASL access
                    control structure...
                </p>

            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="roles-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="roles-hero">

                <div className="roles-hero-copy">

                    <div className="roles-eyebrow">
                        <span />
                        ROLE BASED ACCESS CONTROL
                    </div>

                    <h1>
                        Roles & Permissions
                    </h1>

                    <p>
                        Review WASL system roles,
                        their scope, assigned users
                        and permission coverage.
                    </p>

                </div>

                <div className="roles-hero-stats">

                    <article>

                        <div className="roles-hero-stat-icon">
                            <ShieldCheck
                                size={18}
                            />
                        </div>

                        <span>
                            Roles
                        </span>

                        <strong>
                            {roles.length}
                        </strong>

                    </article>

                    <article>

                        <div className="roles-hero-stat-icon roles-hero-stat-icon-pink">
                            <Users
                                size={18}
                            />
                        </div>

                        <span>
                            Assigned Users
                        </span>

                        <strong>
                            {totalAssignedUsers}
                        </strong>

                    </article>

                </div>

            </section>

            {/* =====================================================
          ERROR
          ===================================================== */}

            {error && (
                <div className="roles-alert">

                    <X
                        size={15}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* =====================================================
          SUMMARY
          ===================================================== */}

            <section className="roles-summary">

                <article>

                    <div className="roles-summary-icon">
                        <ShieldCheck
                            size={17}
                        />
                    </div>

                    <div>

                        <span>
                            Total Roles
                        </span>

                        <strong>
                            {roles.length}
                        </strong>

                        <small>
                            Access profiles
                        </small>

                    </div>

                </article>

                <article>

                    <div className="roles-summary-icon">
                        <Globe2
                            size={17}
                        />
                    </div>

                    <div>

                        <span>
                            Global Roles
                        </span>

                        <strong>
                            {globalRoles}
                        </strong>

                        <small>
                            System-wide scope
                        </small>

                    </div>

                </article>

                <article>

                    <div className="roles-summary-icon roles-summary-icon-pink">
                        <Building2
                            size={17}
                        />
                    </div>

                    <div>

                        <span>
                            Organization Roles
                        </span>

                        <strong>
                            {organizationRoles}
                        </strong>

                        <small>
                            Organization scope
                        </small>

                    </div>

                </article>

            </section>

            {/* =====================================================
          DIRECTORY
          ===================================================== */}

            <section className="roles-directory">

                <div className="roles-directory-header">

                    <div>

                        <span className="roles-section-label">
                            ACCESS DIRECTORY
                        </span>

                        <h2>
                            System Roles
                        </h2>

                        <p>
                            Inspect role definitions,
                            user assignments and
                            permission counts.
                        </p>

                    </div>

                    <div className="roles-count-chip">
                        <KeyRound
                            size={14}
                        />

                        {roles.length} roles
                    </div>

                </div>

                {/* ===================================================
            TOOLBAR
            =================================================== */}

                <div className="roles-toolbar">

                    <div className="roles-search">

                        <Search
                            size={15}
                        />

                        <input
                            type="search"
                            value={
                                search
                            }
                            placeholder="Search role, code or description..."
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

                    <div className="roles-toolbar-note">

                        <ShieldCheck
                            size={14}
                        />

                        RBAC configuration
                    </div>

                </div>

                {/* ===================================================
            EMPTY
            =================================================== */}

                {filteredRoles.length ===
                    0 ? (
                    <div className="roles-empty">

                        <div className="roles-empty-icon">
                            <ShieldCheck
                                size={25}
                            />
                        </div>

                        <strong>
                            {search
                                ? "No matching roles"
                                : "No roles found"}
                        </strong>

                        <p>
                            {search
                                ? "Try searching with another role name or code."
                                : "There are currently no roles available in WASL."}
                        </p>

                    </div>
                ) : (
                    <div className="roles-table-wrap">

                        <table className="roles-table">

                            <thead>

                                <tr>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Users
                                    </th>

                                    <th>
                                        Permissions
                                    </th>

                                    <th>
                                        Scope
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredRoles.map(
                                    (
                                        role
                                    ) => {
                                        const permissionCount =
                                            role._count
                                                ?.permissions ??
                                            role.permissions
                                                ?.length ??
                                            0;

                                        const userCount =
                                            role._count
                                                ?.users ??
                                            0;

                                        const isOrganizationRole =
                                            Boolean(
                                                role.organizationId
                                            );

                                        return (
                                            <tr
                                                key={
                                                    role.id
                                                }
                                            >

                                                {/* ROLE */}

                                                <td>

                                                    <div className="roles-name-cell">

                                                        <div className="roles-role-icon">
                                                            <ShieldCheck
                                                                size={17}
                                                            />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {role.name}
                                                            </strong>

                                                            <span>
                                                                {role.description ||
                                                                    "No description provided"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* CODE */}

                                                <td>

                                                    <code className="roles-code">
                                                        {role.code}
                                                    </code>

                                                </td>

                                                {/* USERS */}

                                                <td>

                                                    <div className="roles-number-cell">

                                                        <Users
                                                            size={14}
                                                        />

                                                        <strong>
                                                            {userCount}
                                                        </strong>

                                                    </div>

                                                </td>

                                                {/* PERMISSIONS */}

                                                <td>

                                                    <div className="roles-number-cell">

                                                        <KeyRound
                                                            size={14}
                                                        />

                                                        <strong>
                                                            {
                                                                permissionCount
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>

                                                {/* SCOPE */}

                                                <td>

                                                    <span
                                                        className={`roles-scope ${isOrganizationRole
                                                                ? "organization"
                                                                : "global"
                                                            }`}
                                                    >

                                                        {isOrganizationRole ? (
                                                            <Building2
                                                                size={13}
                                                            />
                                                        ) : (
                                                            <Globe2
                                                                size={13}
                                                            />
                                                        )}

                                                        {isOrganizationRole
                                                            ? "Organization"
                                                            : "Global"}
                                                    </span>

                                                </td>

                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="roles-manage-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/roles/${role.id}`
                                                            )
                                                        }
                                                    >
                                                        Manage

                                                        <ArrowRight
                                                            size={14}
                                                        />
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
}