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
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    CircleDot,
    Fingerprint,
    KeyRound,
    Landmark,
    MapPin,
    Network,
    Search,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck,
    UserCog,
    UsersRound,
    X,
} from "lucide-react";

import api from "../api/client";

import {
    assignRoleToUser,
    getRoles,
    getUserAccess,
    removeRoleFromUser,
} from "../api/roles.api";

import "../styles/UserDetailsPage.css";

type BaseRole =
    | "EMPLOYEE"
    | "TECHNICIAN"
    | "ADMIN";

interface Department {
    id: number;
    name: string;
}

interface SystemRole {
    id: number;
    name: string;
    code: string;
    description?: string | null;

    permissions?: Array<{
        permission?: {
            id: number;
            name: string;
            code: string;
        };
    }>;
}

interface UserData {
    id: number;
    fullName: string;
    email: string;

    employeeNumber?: string | null;
    jobTitle?: string | null;

    role: BaseRole;
    isActive: boolean;

    department?: Department | null;
    departmentId?: number | null;

    organization?: {
        id: number;
        name: string;
        code?: string;
    } | null;

    branch?: {
        id: number;
        name: string;
    } | null;

    location?: {
        id: number;
        name: string;
    } | null;

    team?: {
        id: number;
        name: string;
    } | null;

    manager?: {
        id: number;
        fullName: string;
        email: string;
    } | null;
}

function formatBaseRole(
    role: BaseRole
) {
    switch (role) {
        case "ADMIN":
            return "Administrator";

        case "TECHNICIAN":
            return "IT Technician";

        case "EMPLOYEE":
            return "Employee";
    }
}

export default function UserDetailsPage() {
    const {
        id,
    } =
        useParams();

    const userId =
        Number(id);

    const [
        user,
        setUser,
    ] =
        useState<UserData | null>(
            null
        );

    const [
        departments,
        setDepartments,
    ] =
        useState<Department[]>([]);

    const [
        roles,
        setRoles,
    ] =
        useState<SystemRole[]>([]);

    const [
        assignedRoleIds,
        setAssignedRoleIds,
    ] =
        useState<number[]>([]);

    const [
        roleSearch,
        setRoleSearch,
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

    /* =====================================================
       EXTRACT ASSIGNED SYSTEM ROLES
       ===================================================== */

    const extractAssignedRoleIds = (
        data: any
    ): number[] => {
        const possibleRoles =
            data?.roles ??
            data?.systemRoles ??
            data?.userRoles ??
            data?.access?.roles ??
            [];

        if (
            !Array.isArray(
                possibleRoles
            )
        ) {
            return [];
        }

        return possibleRoles
            .map(
                (item: any) =>
                    Number(
                        item.roleId ??
                        item.role?.id ??
                        item.id
                    )
            )
            .filter(
                (
                    roleId: number
                ) =>
                    Number.isFinite(
                        roleId
                    )
            );
    };

    /* =====================================================
       FETCH DATA
       ===================================================== */

    const fetchData =
        async () => {
            if (
                !Number.isFinite(
                    userId
                )
            ) {
                setError(
                    "Invalid user ID"
                );

                setLoading(
                    false
                );

                return;
            }

            try {
                setLoading(true);
                setError("");

                const [
                    userResponse,
                    departmentResponse,
                    roleResponse,
                    accessResponse,
                ] =
                    await Promise.all([
                        api.get(
                            `/users/${userId}`
                        ),

                        api.get(
                            "/departments"
                        ),

                        getRoles(),

                        getUserAccess(
                            userId
                        ),
                    ]);

                const userData =
                    userResponse.data
                        ?.data?.user ??
                    userResponse.data
                        ?.data;

                const departmentData =
                    departmentResponse
                        .data?.data
                        ?.departments ??
                    departmentResponse
                        .data?.data ??
                    [];

                const rolesData =
                    roleResponse.data
                        ?.data?.roles ??
                    roleResponse.data
                        ?.data ??
                    [];

                const accessData =
                    accessResponse.data
                        ?.data ??
                    {};

                setUser(
                    userData
                );

                setDepartments(
                    Array.isArray(
                        departmentData
                    )
                        ? departmentData
                        : []
                );

                setRoles(
                    Array.isArray(
                        rolesData
                    )
                        ? rolesData
                        : []
                );

                setAssignedRoleIds(
                    extractAssignedRoleIds(
                        accessData
                    )
                );
            } catch (
            error: any
            ) {
                setError(
                    error.response
                        ?.data
                        ?.message ??
                    "Failed to load user information"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchData();
    }, [userId]);

    /* =====================================================
       UPDATE USER
       ===================================================== */

    const updateUser =
        async (
            data: Partial<{
                role: BaseRole;
                isActive: boolean;
                departmentId:
                | number
                | null;
                jobTitle:
                | string
                | null;
            }>
        ) => {
            try {
                setSaving(true);
                setError("");
                setMessage("");

                await api.patch(
                    `/users/${userId}`,
                    data
                );

                setMessage(
                    "User updated successfully."
                );

                await fetchData();
            } catch (
            error: any
            ) {
                setError(
                    error.response
                        ?.data
                        ?.message ??
                    "Failed to update user"
                );
            } finally {
                setSaving(false);
            }
        };

    /* =====================================================
       SYSTEM ROLE TOGGLE
       ===================================================== */

    const handleRoleToggle =
        async (
            role: SystemRole
        ) => {
            try {
                setSaving(true);
                setError("");
                setMessage("");

                const assigned =
                    assignedRoleIds.includes(
                        role.id
                    );

                if (assigned) {
                    await removeRoleFromUser(
                        role.id,
                        userId
                    );

                    setMessage(
                        `${role.name} removed.`
                    );
                } else {
                    await assignRoleToUser(
                        role.id,
                        userId
                    );

                    setMessage(
                        `${role.name} assigned.`
                    );
                }

                await fetchData();
            } catch (
            error: any
            ) {
                setError(
                    error.response
                        ?.data
                        ?.message ??
                    "Failed to update user role"
                );
            } finally {
                setSaving(false);
            }
        };

    /* =====================================================
       FILTER ROLES
       ===================================================== */

    const filteredRoles =
        useMemo(() => {
            const query =
                roleSearch
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
            roleSearch,
        ]);

    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {
        return (
            <div className="user-details-loading">

                <div className="user-details-loading-icon">
                    <UserCog
                        size={25}
                    />
                </div>

                <strong>
                    Loading user
                </strong>

                <p>
                    Preparing account and
                    access information...
                </p>

            </div>
        );
    }

    /* =====================================================
       NOT FOUND
       ===================================================== */

    if (!user) {
        return (
            <div className="user-details-not-found">

                <div className="user-details-not-found-icon">
                    <User
                        size={25}
                    />
                </div>

                <h2>
                    User not found
                </h2>

                <p>
                    {error ||
                        "The requested user could not be loaded."}
                </p>

                <Link
                    to="/users"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Back to Users
                </Link>

            </div>
        );
    }

    /* =====================================================
       DERIVED
       ===================================================== */

    const initials =
        user.fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part[0]
            )
            .join("")
            .toUpperCase();

    const assignedRolesCount =
        assignedRoleIds.length;

    const organizationLabel =
        user.organization
            ?.name ??
        "Not assigned";

    const departmentLabel =
        user.department
            ?.name ??
        "Not assigned";

    return (
        <div className="user-details-page">

            {/* =================================================
                TOPBAR
                ================================================= */}

            <div className="user-details-topbar">

                <Link
                    to="/users"
                    className="user-details-back"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Users
                </Link>

                <span>
                    PEOPLE / ACCESS MANAGEMENT
                </span>

            </div>

            {/* =================================================
                HERO
                ================================================= */}

            <section className="user-details-hero">

                <div className="user-details-identity">

                    <div className="user-details-avatar">
                        {initials || "U"}

                        {user.isActive && (
                            <span className="user-details-avatar-status">
                                <CheckCircle2
                                    size={13}
                                />
                            </span>
                        )}
                    </div>

                    <div className="user-details-identity-copy">

                        <div className="user-details-eyebrow">
                            <Sparkles
                                size={12}
                            />

                            USER ACCOUNT
                        </div>

                        <h1>
                            {user.fullName}
                        </h1>

                        <p>
                            {user.email}
                        </p>

                        <div className="user-details-hero-badges">

                            <span className="user-details-role-badge">
                                <ShieldCheck
                                    size={12}
                                />

                                {formatBaseRole(
                                    user.role
                                )}
                            </span>

                            <span
                                className={`user-details-status-badge ${user.isActive
                                        ? "active"
                                        : "inactive"
                                    }`}
                            >
                                <span />

                                {user.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>

                            {user.employeeNumber && (
                                <span className="user-details-employee-badge">
                                    <Fingerprint
                                        size={12}
                                    />

                                    {
                                        user.employeeNumber
                                    }
                                </span>
                            )}

                        </div>

                    </div>

                </div>

                <div className="user-details-hero-metrics">

                    <article>

                        <div className="user-details-hero-metric-icon">
                            <Building2
                                size={17}
                            />
                        </div>

                        <span>
                            Department
                        </span>

                        <strong>
                            {departmentLabel}
                        </strong>

                    </article>

                    <article>

                        <div className="user-details-hero-metric-icon pink">
                            <KeyRound
                                size={17}
                            />
                        </div>

                        <span>
                            System Roles
                        </span>

                        <strong>
                            {assignedRolesCount}
                        </strong>

                    </article>

                </div>

            </section>

            {/* =================================================
                ALERTS
                ================================================= */}

            {error && (
                <div className="user-details-alert error">

                    <X
                        size={15}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {message && (
                <div className="user-details-alert success">

                    <CheckCircle2
                        size={15}
                    />

                    <span>
                        {message}
                    </span>

                </div>
            )}

            {/* =================================================
                MAIN GRID
                ================================================= */}

            <section className="user-details-main-grid">

                {/* =============================================
                    ACCOUNT
                    ============================================= */}

                <article className="user-details-card">

                    <div className="user-details-card-header">

                        <div className="user-details-card-icon">
                            <UserCog
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                ACCOUNT PROFILE
                            </span>

                            <h2>
                                Account
                            </h2>

                            <p>
                                Personal and employment
                                account information.
                            </p>

                        </div>

                    </div>

                    <div className="user-details-info-stack">

                        <div className="user-details-readonly-row">

                            <div>
                                <Fingerprint
                                    size={15}
                                />

                                <span>
                                    Employee Number
                                </span>
                            </div>

                            <strong>
                                {user.employeeNumber ??
                                    "—"}
                            </strong>

                        </div>

                        <div className="user-details-readonly-row">

                            <div>
                                <User
                                    size={15}
                                />

                                <span>
                                    Full Name
                                </span>
                            </div>

                            <strong>
                                {user.fullName}
                            </strong>

                        </div>

                        <div className="user-details-readonly-row">

                            <div>
                                <BadgeCheck
                                    size={15}
                                />

                                <span>
                                    Email
                                </span>
                            </div>

                            <strong>
                                {user.email}
                            </strong>

                        </div>

                    </div>

                    <div className="user-details-field">

                        <label
                            htmlFor="user-job-title"
                        >
                            Job Title
                        </label>

                        <div className="user-details-input-shell">

                            <BriefcaseBusiness
                                size={15}
                            />

                            <input
                                id="user-job-title"
                                type="text"
                                defaultValue={
                                    user.jobTitle ??
                                    ""
                                }
                                placeholder="e.g. IT Support Specialist"
                                disabled={
                                    saving
                                }
                                onBlur={(
                                    event
                                ) => {
                                    const value =
                                        event.target
                                            .value
                                            .trim();

                                    if (
                                        value !==
                                        (
                                            user.jobTitle ??
                                            ""
                                        )
                                    ) {
                                        void updateUser({
                                            jobTitle:
                                                value ||
                                                null,
                                        });
                                    }
                                }}
                            />

                        </div>

                        <small>
                            Changes are saved when
                            leaving the field.
                        </small>

                    </div>

                </article>

                {/* =============================================
                    BASE ACCESS
                    ============================================= */}

                <article className="user-details-card">

                    <div className="user-details-card-header">

                        <div className="user-details-card-icon pink">
                            <ShieldCheck
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                CORE ACCESS
                            </span>

                            <h2>
                                Base Access
                            </h2>

                            <p>
                                Configure the user's
                                primary WASL account role.
                            </p>

                        </div>

                    </div>

                    <div className="user-details-form-grid">

                        <div className="user-details-field">

                            <label
                                htmlFor="user-base-role"
                            >
                                Base Role
                            </label>

                            <div className="user-details-select-shell">

                                <ShieldCheck
                                    size={15}
                                />

                                <select
                                    id="user-base-role"
                                    value={
                                        user.role
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        void updateUser({
                                            role:
                                                event
                                                    .target
                                                    .value as BaseRole,
                                        })
                                    }
                                >
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

                        </div>

                        <div className="user-details-field">

                            <label
                                htmlFor="user-status"
                            >
                                Account Status
                            </label>

                            <div className="user-details-select-shell">

                                <CircleDot
                                    size={15}
                                />

                                <select
                                    id="user-status"
                                    value={
                                        user.isActive
                                            ? "ACTIVE"
                                            : "INACTIVE"
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        void updateUser({
                                            isActive:
                                                event
                                                    .target
                                                    .value ===
                                                "ACTIVE",
                                        })
                                    }
                                >
                                    <option value="ACTIVE">
                                        Active
                                    </option>

                                    <option value="INACTIVE">
                                        Inactive
                                    </option>

                                </select>

                            </div>

                        </div>

                        <div className="user-details-field full">

                            <label
                                htmlFor="user-department"
                            >
                                Department
                            </label>

                            <div className="user-details-select-shell">

                                <Building2
                                    size={15}
                                />

                                <select
                                    id="user-department"
                                    value={
                                        user.department
                                            ?.id ??
                                        user.departmentId ??
                                        ""
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        void updateUser({
                                            departmentId:
                                                event
                                                    .target
                                                    .value
                                                    ? Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                    : null,
                                        })
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

                    </div>

                    <div className="user-details-access-note">

                        <ShieldCheck
                            size={15}
                        />

                        <div>

                            <strong>
                                Base role
                            </strong>

                            <p>
                                Provides the user's
                                primary account category.
                                Detailed access is managed
                                through System Roles below.
                            </p>

                        </div>

                    </div>

                </article>

            </section>

            {/* =================================================
                ORGANIZATION STRUCTURE
                ================================================= */}

            <section className="user-details-card user-details-organization-card">

                <div className="user-details-card-header">

                    <div className="user-details-card-icon">
                        <Network
                            size={18}
                        />
                    </div>

                    <div>

                        <span>
                            ORGANIZATION STRUCTURE
                        </span>

                        <h2>
                            Placement
                        </h2>

                        <p>
                            Current organization,
                            branch, location, team
                            and reporting manager.
                        </p>

                    </div>

                </div>

                <div className="user-details-org-grid">

                    <OrgItem
                        icon={
                            <Landmark
                                size={17}
                            />
                        }
                        label="Organization"
                        value={
                            organizationLabel
                        }
                        secondary={
                            user.organization
                                ?.code
                        }
                    />

                    <OrgItem
                        icon={
                            <Building2
                                size={17}
                            />
                        }
                        label="Branch"
                        value={
                            user.branch
                                ?.name ??
                            "Not assigned"
                        }
                    />

                    <OrgItem
                        icon={
                            <MapPin
                                size={17}
                            />
                        }
                        label="Location"
                        value={
                            user.location
                                ?.name ??
                            "Not assigned"
                        }
                    />

                    <OrgItem
                        icon={
                            <UsersRound
                                size={17}
                            />
                        }
                        label="Team"
                        value={
                            user.team
                                ?.name ??
                            "Not assigned"
                        }
                    />

                    <OrgItem
                        icon={
                            <UserCheck
                                size={17}
                            />
                        }
                        label="Manager"
                        value={
                            user.manager
                                ?.fullName ??
                            "Not assigned"
                        }
                        secondary={
                            user.manager
                                ?.email
                        }
                    />

                </div>

            </section>

            {/* =================================================
                SYSTEM ROLES
                ================================================= */}

            <section className="user-details-roles-card">

                <div className="user-details-roles-header">

                    <div>

                        <span className="user-details-section-label">
                            RBAC ACCESS
                        </span>

                        <h2>
                            System Roles
                        </h2>

                        <p>
                            Assign detailed permissions
                            through WASL system roles.
                        </p>

                    </div>

                    <div className="user-details-role-count">

                        <KeyRound
                            size={14}
                        />

                        <strong>
                            {assignedRolesCount}
                        </strong>

                        <span>
                            assigned
                        </span>

                    </div>

                </div>

                {/* =============================================
                    ROLE SEARCH
                    ============================================= */}

                <div className="user-details-role-toolbar">

                    <div className="user-details-role-search">

                        <Search
                            size={15}
                        />

                        <input
                            type="search"
                            value={
                                roleSearch
                            }
                            placeholder="Search role or permission profile..."
                            onChange={(
                                event
                            ) =>
                                setRoleSearch(
                                    event.target
                                        .value
                                )
                            }
                        />

                        {roleSearch && (
                            <button
                                type="button"
                                aria-label="Clear role search"
                                onClick={() =>
                                    setRoleSearch("")
                                }
                            >
                                <X
                                    size={14}
                                />
                            </button>
                        )}

                    </div>

                    <span className="user-details-rbac-note">
                        <ShieldCheck
                            size={13}
                        />

                        Detailed permissions
                    </span>

                </div>

                {/* =============================================
                    ROLES
                    ============================================= */}

                {filteredRoles.length ===
                    0 ? (
                    <div className="user-details-empty">

                        <div className="user-details-empty-icon">
                            <KeyRound
                                size={24}
                            />
                        </div>

                        <strong>
                            {roleSearch
                                ? "No matching roles"
                                : "No system roles found"}
                        </strong>

                        <p>
                            {roleSearch
                                ? "Try searching with another role name or code."
                                : "There are currently no system roles available."}
                        </p>

                    </div>
                ) : (
                    <div className="user-details-role-grid">

                        {filteredRoles.map(
                            (
                                role
                            ) => {
                                const assigned =
                                    assignedRoleIds.includes(
                                        role.id
                                    );

                                const permissionCount =
                                    role.permissions
                                        ?.length ??
                                    0;

                                return (
                                    <article
                                        key={
                                            role.id
                                        }
                                        className={`user-details-role-card ${assigned
                                                ? "assigned"
                                                : ""
                                            }`}
                                    >

                                        <div className="user-details-role-card-top">

                                            <div className="user-details-role-icon">
                                                <ShieldCheck
                                                    size={17}
                                                />
                                            </div>

                                            <span
                                                className={`user-details-role-state ${assigned
                                                        ? "assigned"
                                                        : ""
                                                    }`}
                                            >
                                                <span />

                                                {assigned
                                                    ? "Assigned"
                                                    : "Not Assigned"}
                                            </span>

                                        </div>

                                        <div className="user-details-role-copy">

                                            <span>
                                                SYSTEM ROLE
                                            </span>

                                            <h3>
                                                {
                                                    role.name
                                                }
                                            </h3>

                                            <code>
                                                {
                                                    role.code
                                                }
                                            </code>

                                            <p>
                                                {role.description ||
                                                    "No description provided."}
                                            </p>

                                        </div>

                                        <div className="user-details-role-footer">

                                            <span>
                                                <KeyRound
                                                    size={13}
                                                />

                                                {
                                                    permissionCount
                                                }{" "}
                                                permissions
                                            </span>

                                            <button
                                                type="button"
                                                disabled={
                                                    saving
                                                }
                                                className={
                                                    assigned
                                                        ? "remove"
                                                        : "assign"
                                                }
                                                onClick={() =>
                                                    void handleRoleToggle(
                                                        role
                                                    )
                                                }
                                            >
                                                {assigned ? (
                                                    <>
                                                        <X
                                                            size={13}
                                                        />

                                                        Remove
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2
                                                            size={13}
                                                        />

                                                        Assign
                                                    </>
                                                )}
                                            </button>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>
                )}

            </section>

        </div>
    );
}

/* =========================================================
   SMALL COMPONENT
   ========================================================= */

function OrgItem({
    icon,
    label,
    value,
    secondary,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    secondary?: string;
}) {
    return (
        <article className="user-details-org-item">

            <div className="user-details-org-icon">
                {icon}
            </div>

            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

                {secondary && (
                    <small>
                        {secondary}
                    </small>
                )}

            </div>

        </article>
    );
}