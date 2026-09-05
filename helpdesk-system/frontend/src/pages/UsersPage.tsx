import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    ChevronRight,
    CircleDot,
    Filter,
    Fingerprint,
    Search,
    ShieldCheck,
    Sparkles,
    UserCog,
    UsersRound,
    X,
} from "lucide-react";

import api from "../api/client";

import "../styles/UsersPage.css";

type UserRole =
    | "EMPLOYEE"
    | "TECHNICIAN"
    | "ADMIN";

interface Organization {
    id: number;
    name: string;
    code?: string;
}

interface Department {
    id: number;
    name: string;
}

interface User {
    id: number;
    fullName: string;
    email: string;

    employeeNumber?: string | null;
    jobTitle?: string | null;

    role: UserRole;
    isActive: boolean;

    organization?: Organization | null;
    department?: Department | null;
}

function formatRole(
    role: UserRole
) {
    switch (role) {
        case "ADMIN":
            return "Administrator";

        case "TECHNICIAN":
            return "Technician";

        case "EMPLOYEE":
            return "Employee";
    }
}

export default function UsersPage() {
    const navigate =
        useNavigate();

    const [
        users,
        setUsers,
    ] =
        useState<User[]>([]);

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
        roleFilter,
        setRoleFilter,
    ] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState("");

    /* =====================================================
       FETCH
       ===================================================== */

    const fetchUsers =
        async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await api.get(
                        "/users"
                    );

                const data =
                    response.data
                        ?.data;

                setUsers(
                    data?.users ??
                    data ??
                    []
                );
            } catch (
            error: any
            ) {
                setError(
                    error.response
                        ?.data
                        ?.message ??
                    "Failed to load users"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchUsers();
    }, []);

    /* =====================================================
       FILTER
       ===================================================== */

    const filteredUsers =
        useMemo(() => {
            const normalizedSearch =
                search
                    .trim()
                    .toLowerCase();

            return users.filter(
                (user) => {
                    const matchesSearch =
                        !normalizedSearch ||
                        user.fullName
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        user.email
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        user.employeeNumber
                            ?.toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        user.jobTitle
                            ?.toLowerCase()
                            .includes(
                                normalizedSearch
                            );

                    const matchesRole =
                        !roleFilter ||
                        user.role ===
                        roleFilter;

                    const matchesStatus =
                        !statusFilter ||
                        (
                            statusFilter ===
                                "ACTIVE"
                                ? user.isActive
                                : !user.isActive
                        );

                    return (
                        matchesSearch &&
                        matchesRole &&
                        matchesStatus
                    );
                }
            );
        }, [
            users,
            search,
            roleFilter,
            statusFilter,
        ]);

    /* =====================================================
       REAL STATS
       ===================================================== */

    const stats =
        useMemo(() => {
            const active =
                users.filter(
                    (user) =>
                        user.isActive
                ).length;

            const employees =
                users.filter(
                    (user) =>
                        user.role ===
                        "EMPLOYEE"
                ).length;

            const technicians =
                users.filter(
                    (user) =>
                        user.role ===
                        "TECHNICIAN"
                ).length;

            const admins =
                users.filter(
                    (user) =>
                        user.role ===
                        "ADMIN"
                ).length;

            return {
                active,
                employees,
                technicians,
                admins,
            };
        }, [users]);

    const hasFilters =
        Boolean(
            search ||
            roleFilter ||
            statusFilter
        );

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("");
        setStatusFilter("");
    };

    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {
        return (
            <div className="users-page-loading">

                <div className="users-page-loading-icon">
                    <UsersRound
                        size={25}
                    />
                </div>

                <strong>
                    Loading users
                </strong>

                <p>
                    Preparing WASL user
                    directory...
                </p>

            </div>
        );
    }

    return (
        <div className="users-page">

            {/* =================================================
                HERO
                ================================================= */}

            <section className="users-hero">

                <div className="users-hero-copy">

                    <div className="users-eyebrow">
                        <Sparkles
                            size={12}
                        />

                        PEOPLE & ACCESS
                    </div>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Manage WASL users,
                        account status, base
                        access and organizational
                        placement.
                    </p>

                    <div className="users-hero-tags">

                        <span>
                            <UsersRound
                                size={12}
                            />

                            {users.length}
                            {" "}
                            total users
                        </span>

                        <span>
                            <CheckCircle2
                                size={12}
                            />

                            {stats.active}
                            {" "}
                            active
                        </span>

                    </div>

                </div>

                <div className="users-hero-metrics">

                    <article>

                        <div className="users-hero-metric-icon">
                            <BadgeCheck
                                size={17}
                            />
                        </div>

                        <span>
                            Employees
                        </span>

                        <strong>
                            {
                                stats.employees
                            }
                        </strong>

                    </article>

                    <article>

                        <div className="users-hero-metric-icon pink">
                            <BriefcaseBusiness
                                size={17}
                            />
                        </div>

                        <span>
                            Technicians
                        </span>

                        <strong>
                            {
                                stats.technicians
                            }
                        </strong>

                    </article>

                    <article>

                        <div className="users-hero-metric-icon brown">
                            <ShieldCheck
                                size={17}
                            />
                        </div>

                        <span>
                            Administrators
                        </span>

                        <strong>
                            {
                                stats.admins
                            }
                        </strong>

                    </article>

                </div>

            </section>

            {/* =================================================
                ERROR
                ================================================= */}

            {error && (
                <div className="users-alert-error">

                    <X
                        size={15}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* =================================================
                DIRECTORY
                ================================================= */}

            <section className="users-directory-card">

                <div className="users-directory-header">

                    <div>

                        <span className="users-section-label">
                            USER DIRECTORY
                        </span>

                        <h2>
                            Accounts
                        </h2>

                        <p>
                            Search and review users
                            registered in WASL.
                        </p>

                    </div>

                    <div className="users-directory-count">

                        <UsersRound
                            size={14}
                        />

                        <strong>
                            {
                                filteredUsers
                                    .length
                            }
                        </strong>

                        <span>
                            results
                        </span>

                    </div>

                </div>

                {/* =============================================
                    FILTERS
                    ============================================= */}

                <div className="users-toolbar">

                    <div className="users-search">

                        <Search
                            size={15}
                        />

                        <input
                            type="search"
                            placeholder="Search name, email, employee number or job title..."
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

                    <div className="users-filter-shell">

                        <ShieldCheck
                            size={14}
                        />

                        <select
                            value={
                                roleFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setRoleFilter(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option value="">
                                All Roles
                            </option>

                            <option value="EMPLOYEE">
                                Employee
                            </option>

                            <option value="TECHNICIAN">
                                Technician
                            </option>

                            <option value="ADMIN">
                                Administrator
                            </option>

                        </select>

                    </div>

                    <div className="users-filter-shell">

                        <Filter
                            size={14}
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

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>

                        </select>

                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            className="users-clear-button"
                            onClick={
                                clearFilters
                            }
                        >
                            <X
                                size={13}
                            />

                            Clear
                        </button>
                    )}

                </div>

                {/* =============================================
                    EMPTY
                    ============================================= */}

                {filteredUsers.length ===
                    0 ? (
                    <div className="users-empty">

                        <div className="users-empty-icon">
                            <Search
                                size={23}
                            />
                        </div>

                        <strong>
                            No users found
                        </strong>

                        <p>
                            {hasFilters
                                ? "No users match the current search and filters."
                                : "There are no users available."}
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>
                ) : (
                    <div className="users-table-wrap">

                        <table className="users-table">

                            <thead>

                                <tr>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Job Title
                                    </th>

                                    <th>
                                        Base Role
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredUsers.map(
                                    (user) => {
                                        const initials =
                                            user.fullName
                                                .split(" ")
                                                .filter(
                                                    Boolean
                                                )
                                                .slice(
                                                    0,
                                                    2
                                                )
                                                .map(
                                                    (
                                                        part
                                                    ) =>
                                                        part[0]
                                                )
                                                .join("")
                                                .toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >

                                                {/* USER */}

                                                <td>

                                                    <div className="users-person-cell">

                                                        <div className="users-avatar">
                                                            {initials ||
                                                                "U"}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    user.fullName
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    user.email
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* EMPLOYEE */}

                                                <td>

                                                    {user.employeeNumber ? (
                                                        <span className="users-employee-number">

                                                            <Fingerprint
                                                                size={12}
                                                            />

                                                            {
                                                                user.employeeNumber
                                                            }

                                                        </span>
                                                    ) : (
                                                        <span className="users-muted">
                                                            —
                                                        </span>
                                                    )}

                                                </td>

                                                {/* JOB */}

                                                <td>

                                                    <div className="users-job">

                                                        <BriefcaseBusiness
                                                            size={13}
                                                        />

                                                        <span>
                                                            {user.jobTitle ??
                                                                "—"}
                                                        </span>

                                                    </div>

                                                </td>

                                                {/* ROLE */}

                                                <td>

                                                    <span
                                                        className={`users-role role-${user.role.toLowerCase()}`}
                                                    >
                                                        <ShieldCheck
                                                            size={12}
                                                        />

                                                        {formatRole(
                                                            user.role
                                                        )}
                                                    </span>

                                                </td>

                                                {/* DEPARTMENT */}

                                                <td>

                                                    {user.department
                                                        ?.name ? (
                                                        <span className="users-department">

                                                            <Building2
                                                                size={12}
                                                            />

                                                            {
                                                                user
                                                                    .department
                                                                    .name
                                                            }

                                                        </span>
                                                    ) : (
                                                        <span className="users-muted">
                                                            —
                                                        </span>
                                                    )}

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`users-status ${user.isActive
                                                                ? "active"
                                                                : "inactive"
                                                            }`}
                                                    >
                                                        <span />

                                                        {user.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>

                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="users-manage-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/users/${user.id}`
                                                            )
                                                        }
                                                    >
                                                        <UserCog
                                                            size={13}
                                                        />

                                                        Manage

                                                        <ChevronRight
                                                            size={13}
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