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
    GitBranch,
    Hash,
    MapPinned,
    Plus,
    Search,
    Sparkles,
} from "lucide-react";

import api from "../api/client";

import "../styles/BranchesPage.css";

interface Organization {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
    code?: string | null;

    organizationId?: number;

    organization?: Organization | null;

    isActive?: boolean;
}

export default function BranchesPage() {
    const [
        branches,
        setBranches,
    ] = useState<Branch[]>([]);

    const [
        organizations,
        setOrganizations,
    ] = useState<Organization[]>([]);

    const [
        name,
        setName,
    ] = useState("");

    const [
        code,
        setCode,
    ] = useState("");

    const [
        organizationId,
        setOrganizationId,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    /* =========================================================
       FETCH
       ========================================================= */

    const fetchData = async () => {
        try {
            setError("");

            const [
                branchesResponse,
                organizationsResponse,
            ] = await Promise.all([
                api.get("/branches"),
                api.get(
                    "/organizations"
                ),
            ]);

            const branchesData =
                branchesResponse.data
                    ?.data?.branches ??
                branchesResponse.data
                    ?.data ??
                [];

            const organizationsData =
                organizationsResponse
                    .data?.data
                    ?.organizations ??
                organizationsResponse
                    .data?.data ??
                [];

            setBranches(
                Array.isArray(
                    branchesData
                )
                    ? branchesData
                    : []
            );

            setOrganizations(
                Array.isArray(
                    organizationsData
                )
                    ? organizationsData
                    : []
            );
        } catch (
        error: any
        ) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to load branches"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    /* =========================================================
       CREATE BRANCH
       ========================================================= */

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (
            !name.trim() ||
            !organizationId
        ) {
            setError(
                "Branch name and organization are required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.post(
                "/branches",
                {
                    name:
                        name.trim(),

                    organizationId:
                        Number(
                            organizationId
                        ),

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
            setOrganizationId("");

            setMessage(
                "Branch created successfully."
            );

            await fetchData();
        } catch (
        error: any
        ) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to create branch"
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       FILTER
       ========================================================= */

    const filteredBranches =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return branches;
            }

            return branches.filter(
                (branch) => {
                    const organizationName =
                        branch.organization
                            ?.name ??
                        organizations.find(
                            (
                                organization
                            ) =>
                                organization.id ===
                                branch.organizationId
                        )?.name ??
                        "";

                    return (
                        branch.name
                            .toLowerCase()
                            .includes(query) ||
                        branch.code
                            ?.toLowerCase()
                            .includes(query) ||
                        organizationName
                            .toLowerCase()
                            .includes(query)
                    );
                }
            );
        }, [
            branches,
            organizations,
            search,
        ]);

    /* =========================================================
       STATS
       ========================================================= */

    const activeBranches =
        branches.filter(
            (branch) =>
                branch.isActive !==
                false
        ).length;

    const inactiveBranches =
        branches.length -
        activeBranches;

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="branches-loading">

                <div className="branches-loading-spinner" />

                <p>
                    Loading branches...
                </p>

            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="branches-page">

            {/* HEADER */}

            <section className="branches-header">

                <div className="branches-header-content">

                    <span className="branches-eyebrow">
                        ORGANIZATION
                    </span>

                    <h1>
                        Branches
                    </h1>

                    <p>
                        Manage your organization's
                        branches and their operational
                        status across WASL.
                    </p>

                </div>

                <div className="branches-header-decoration">

                    <span />

                    <GitBranch
                        size={31}
                        strokeWidth={1.6}
                    />

                </div>

            </section>

            {/* STATS */}

            <section className="branches-stats">

                <article className="branches-stat-card">

                    <div className="branches-stat-icon">
                        <GitBranch
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Total Branches
                        </span>

                        <strong>
                            {branches.length}
                        </strong>

                        <p>
                            Registered branches
                        </p>
                    </div>

                </article>

                <article className="branches-stat-card">

                    <div className="branches-stat-icon active">
                        <CheckCircle2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Active
                        </span>

                        <strong>
                            {activeBranches}
                        </strong>

                        <p>
                            Operational branches
                        </p>
                    </div>

                </article>

                <article className="branches-stat-card">

                    <div className="branches-stat-icon inactive">
                        <Building2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Inactive
                        </span>

                        <strong>
                            {inactiveBranches}
                        </strong>

                        <p>
                            Currently inactive
                        </p>
                    </div>

                </article>

                <article className="branches-stat-card">

                    <div className="branches-stat-icon organizations">
                        <MapPinned
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Organizations
                        </span>

                        <strong>
                            {organizations.length}
                        </strong>

                        <p>
                            Available organizations
                        </p>
                    </div>

                </article>

            </section>

            {/* MESSAGES */}

            {error && (
                <div
                    className="branches-alert error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {message && (
                <div
                    className="branches-alert success"
                    role="status"
                >
                    <CheckCircle2
                        size={17}
                    />

                    {message}
                </div>
            )}

            {/* CREATE */}

            <section className="branches-create-card">

                <div className="branches-card-heading">

                    <div className="branches-card-heading-icon">
                        <Plus
                            size={19}
                        />
                    </div>

                    <div>

                        <span>
                            NEW BRANCH
                        </span>

                        <h2>
                            Add Branch
                        </h2>

                        <p>
                            Register a new branch and
                            connect it to an organization.
                        </p>

                    </div>

                </div>

                <form
                    className="branches-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="branches-field">

                        <label htmlFor="branch-organization">
                            Organization
                        </label>

                        <div className="branches-input-shell">

                            <Building2
                                size={17}
                            />

                            <select
                                id="branch-organization"
                                value={
                                    organizationId
                                }
                                disabled={
                                    saving
                                }
                                onChange={(
                                    event
                                ) =>
                                    setOrganizationId(
                                        event.target
                                            .value
                                    )
                                }
                            >

                                <option value="">
                                    Select Organization
                                </option>

                                {organizations.map(
                                    (
                                        organization
                                    ) => (
                                        <option
                                            key={
                                                organization.id
                                            }
                                            value={
                                                organization.id
                                            }
                                        >
                                            {
                                                organization.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                    </div>

                    <div className="branches-field">

                        <label htmlFor="branch-name">
                            Branch Name
                        </label>

                        <div className="branches-input-shell">

                            <GitBranch
                                size={17}
                            />

                            <input
                                id="branch-name"
                                type="text"
                                value={
                                    name
                                }
                                placeholder="Makkah Branch"
                                disabled={
                                    saving
                                }
                                onChange={(
                                    event
                                ) =>
                                    setName(
                                        event.target
                                            .value
                                    )
                                }
                            />

                        </div>

                    </div>

                    <div className="branches-field">

                        <label htmlFor="branch-code">
                            Branch Code
                        </label>

                        <div className="branches-input-shell">

                            <Hash
                                size={17}
                            />

                            <input
                                id="branch-code"
                                type="text"
                                value={
                                    code
                                }
                                placeholder="MKH"
                                disabled={
                                    saving
                                }
                                maxLength={12}
                                onChange={(
                                    event
                                ) =>
                                    setCode(
                                        event.target
                                            .value
                                    )
                                }
                            />

                        </div>

                    </div>

                    <button
                        className="branches-submit-button"
                        type="submit"
                        disabled={
                            saving ||
                            !name.trim() ||
                            !organizationId
                        }
                    >

                        {saving ? (
                            <>
                                <span className="branches-button-spinner" />

                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus
                                    size={17}
                                />

                                Add Branch
                            </>
                        )}

                    </button>

                </form>

            </section>

            {/* DIRECTORY */}

            <section className="branches-directory">

                <div className="branches-directory-header">

                    <div>

                        <span>
                            DIRECTORY
                        </span>

                        <h2>
                            Branch Directory
                        </h2>

                        <p>
                            View all branches registered
                            in the system.
                        </p>

                    </div>

                    <div className="branches-search">

                        <Search
                            size={17}
                        />

                        <input
                            type="search"
                            placeholder="Search branches..."
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

                </div>

                {filteredBranches.length ===
                    0 ? (
                    <div className="branches-empty">

                        <div className="branches-empty-icon">
                            <GitBranch
                                size={27}
                            />
                        </div>

                        <h3>
                            No branches found
                        </h3>

                        <p>
                            {search
                                ? "No branch matches your search."
                                : "Create your first branch to get started."}
                        </p>

                    </div>
                ) : (
                    <div className="branches-table-wrapper">

                        <table className="branches-table">

                            <thead>

                                <tr>

                                    <th>
                                        Branch
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Organization
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredBranches.map(
                                    (
                                        branch,
                                        index
                                    ) => {
                                        const organizationName =
                                            branch.organization
                                                ?.name ??
                                            organizations.find(
                                                (
                                                    organization
                                                ) =>
                                                    organization.id ===
                                                    branch.organizationId
                                            )?.name ??
                                            "—";

                                        const isActive =
                                            branch.isActive !==
                                            false;

                                        return (
                                            <tr
                                                key={
                                                    branch.id
                                                }
                                                style={{
                                                    animationDelay:
                                                        `${index * 35}ms`,
                                                }}
                                            >

                                                <td>

                                                    <div className="branches-name-cell">

                                                        <div className="branches-row-icon">
                                                            <GitBranch
                                                                size={17}
                                                            />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {branch.name}
                                                            </strong>

                                                            <span>
                                                                Branch #{branch.id}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    {branch.code ? (
                                                        <span className="branches-code">
                                                            {branch.code}
                                                        </span>
                                                    ) : (
                                                        <span className="branches-muted">
                                                            —
                                                        </span>
                                                    )}

                                                </td>

                                                <td>

                                                    <div className="branches-organization-cell">

                                                        <Building2
                                                            size={16}
                                                        />

                                                        <span>
                                                            {organizationName}
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            isActive
                                                                ? "branches-status active"
                                                                : "branches-status inactive"
                                                        }
                                                    >

                                                        <span />

                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}

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

                <div className="branches-directory-footer">

                    <Sparkles
                        size={14}
                    />

                    Showing{" "}
                    <strong>
                        {filteredBranches.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {branches.length}
                    </strong>{" "}
                    branches

                </div>

            </section>

        </div>
    );
}