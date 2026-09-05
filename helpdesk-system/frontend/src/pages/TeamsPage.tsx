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
    Network,
    Plus,
    Search,
    Sparkles,
    UsersRound,
    X,
} from "lucide-react";

import api from "../api/client";

import "../styles/TeamsPage.css";

interface Department {
    id: number;
    name: string;
}

interface Team {
    id: number;
    name: string;
    departmentId?: number | null;
    department?: Department | null;
    isActive?: boolean;
}

export default function TeamsPage() {
    const [
        teams,
        setTeams,
    ] =
        useState<Team[]>([]);

    const [
        departments,
        setDepartments,
    ] =
        useState<Department[]>([]);

    const [
        name,
        setName,
    ] =
        useState("");

    const [
        departmentId,
        setDepartmentId,
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
       LOAD DATA
       ========================================================= */

    const fetchData =
        async () => {
            try {
                setError("");

                const [
                    teamsResponse,
                    departmentsResponse,
                ] =
                    await Promise.all([
                        api.get(
                            "/teams"
                        ),
                        api.get(
                            "/departments"
                        ),
                    ]);

                const teamsData =
                    teamsResponse.data?.data
                        ?.teams ??
                    teamsResponse.data?.data ??
                    [];

                const departmentsData =
                    departmentsResponse.data
                        ?.data?.departments ??
                    departmentsResponse.data
                        ?.data ??
                    [];

                setTeams(
                    Array.isArray(
                        teamsData
                    )
                        ? teamsData
                        : []
                );

                setDepartments(
                    Array.isArray(
                        departmentsData
                    )
                        ? departmentsData
                        : []
                );
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to load teams"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchData();
    }, []);

    /* =========================================================
       CREATE TEAM
       ========================================================= */

    const handleSubmit =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();

            if (!name.trim()) {
                setError(
                    "Team name is required."
                );

                return;
            }

            try {
                setSaving(true);

                setError("");
                setMessage("");

                await api.post(
                    "/teams",
                    {
                        name:
                            name.trim(),

                        ...(departmentId
                            ? {
                                departmentId:
                                    Number(
                                        departmentId
                                    ),
                            }
                            : {}),
                    }
                );

                setName("");
                setDepartmentId("");

                setMessage(
                    "Team created successfully."
                );

                await fetchData();
            } catch (
            error: any
            ) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to create team"
                );
            } finally {
                setSaving(false);
            }
        };

    /* =========================================================
       FILTER
       ========================================================= */

    const filteredTeams =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return teams;
            }

            return teams.filter(
                (team) => {
                    const departmentName =
                        team.department
                            ?.name ??
                        departments.find(
                            (department) =>
                                department.id ===
                                team.departmentId
                        )?.name ??
                        "";

                    return (
                        team.name
                            .toLowerCase()
                            .includes(query) ||
                        departmentName
                            .toLowerCase()
                            .includes(query) ||
                        String(
                            team.id
                        ).includes(query)
                    );
                }
            );
        }, [
            teams,
            departments,
            search,
        ]);

    const linkedTeams =
        useMemo(() => {
            return teams.filter(
                (team) =>
                    Boolean(
                        team.departmentId ||
                        team.department
                    )
            ).length;
        }, [teams]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="teams-loading">

                <div className="teams-loading-icon">
                    <UsersRound
                        size={25}
                    />
                </div>

                <strong>
                    Loading teams
                </strong>

                <p>
                    Preparing WASL work
                    teams...
                </p>

            </div>
        );
    }

    return (
        <div className="teams-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="teams-hero">

                <div className="teams-hero-copy">

                    <div className="teams-eyebrow">
                        <span />
                        WORKFORCE STRUCTURE
                    </div>

                    <h1>
                        Teams
                    </h1>

                    <p>
                        Organize internal work teams
                        and connect them with the
                        departments they support
                        across WASL.
                    </p>

                </div>

                <div className="teams-hero-stats">

                    <article>

                        <div className="teams-hero-stat-icon">
                            <UsersRound
                                size={18}
                            />
                        </div>

                        <span>
                            Teams
                        </span>

                        <strong>
                            {teams.length}
                        </strong>

                    </article>

                    <article>

                        <div className="teams-hero-stat-icon teams-hero-stat-icon-pink">
                            <Building2
                                size={18}
                            />
                        </div>

                        <span>
                            Department Linked
                        </span>

                        <strong>
                            {linkedTeams}
                        </strong>

                    </article>

                </div>

            </section>

            {/* =====================================================
          ALERTS
          ===================================================== */}

            {error && (
                <div className="teams-alert teams-alert-error">

                    <X
                        size={15}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {message && (
                <div className="teams-alert teams-alert-success">

                    <CheckCircle2
                        size={15}
                    />

                    <span>
                        {message}
                    </span>

                </div>
            )}

            {/* =====================================================
          WORKSPACE
          ===================================================== */}

            <section className="teams-workspace">

                {/* ===================================================
            CREATE TEAM
            =================================================== */}

                <article className="teams-create-card">

                    <div className="teams-card-header">

                        <div className="teams-card-header-icon">
                            <Plus
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                NEW TEAM
                            </span>

                            <h2>
                                Create Team
                            </h2>

                            <p>
                                Add a new internal
                                work team to WASL.
                            </p>

                        </div>

                    </div>

                    <form
                        className="teams-create-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* TEAM NAME */}

                        <div className="teams-field">

                            <label
                                htmlFor="team-name"
                            >
                                Team Name
                                <b>*</b>
                            </label>

                            <div className="teams-input-shell">

                                <UsersRound
                                    size={16}
                                />

                                <input
                                    id="team-name"
                                    type="text"
                                    value={
                                        name
                                    }
                                    placeholder="e.g. Service Desk Team"
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

                        {/* DEPARTMENT */}

                        <div className="teams-field">

                            <label
                                htmlFor="team-department"
                            >
                                Department
                            </label>

                            <div className="teams-select-shell">

                                <Building2
                                    size={16}
                                />

                                <select
                                    id="team-department"
                                    value={
                                        departmentId
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setDepartmentId(
                                            event.target.value
                                        );

                                        setError("");
                                        setMessage("");
                                    }}
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

                            <small>
                                Optional. A team can
                                exist without a linked
                                department.
                            </small>

                        </div>

                        <button
                            type="submit"
                            className="teams-create-button"
                            disabled={
                                saving ||
                                !name.trim()
                            }
                        >
                            {saving ? (
                                <>
                                    <span className="teams-spinner" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus
                                        size={16}
                                    />
                                    Add Team
                                </>
                            )}
                        </button>

                    </form>

                    <div className="teams-note">

                        <Sparkles
                            size={15}
                        />

                        <span>
                            Teams represent internal
                            operational groups inside
                            WASL.
                        </span>

                    </div>

                </article>

                {/* ===================================================
            DIRECTORY
            =================================================== */}

                <article className="teams-directory">

                    <div className="teams-directory-header">

                        <div>

                            <span className="teams-section-label">
                                TEAM DIRECTORY
                            </span>

                            <h2>
                                Internal Teams
                            </h2>

                            <p>
                                Browse teams and their
                                department relationships.
                            </p>

                        </div>

                        <div className="teams-count-chip">
                            <UsersRound
                                size={14}
                            />

                            {teams.length} teams
                        </div>

                    </div>

                    {/* TOOLBAR */}

                    <div className="teams-toolbar">

                        <div className="teams-search">

                            <Search
                                size={15}
                            />

                            <input
                                type="search"
                                value={
                                    search
                                }
                                placeholder="Search team or department..."
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

                        <div className="teams-toolbar-note">

                            <Network
                                size={14}
                            />

                            Internal workgroups
                        </div>

                    </div>

                    {/* EMPTY */}

                    {filteredTeams.length ===
                        0 ? (
                        <div className="teams-empty">

                            <div className="teams-empty-icon">
                                <UsersRound
                                    size={25}
                                />
                            </div>

                            <strong>
                                {search
                                    ? "No matching teams"
                                    : "No teams found"}
                            </strong>

                            <p>
                                {search
                                    ? "Try another team or department name."
                                    : "Create the first team using the form."}
                            </p>

                        </div>
                    ) : (
                        <div className="teams-table-wrap">

                            <table className="teams-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Team
                                        </th>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Team ID
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredTeams.map(
                                        (
                                            team
                                        ) => {
                                            const departmentName =
                                                team.department
                                                    ?.name ??
                                                departments.find(
                                                    (
                                                        department
                                                    ) =>
                                                        department.id ===
                                                        team.departmentId
                                                )?.name ??
                                                "—";

                                            return (
                                                <tr
                                                    key={
                                                        team.id
                                                    }
                                                >

                                                    {/* TEAM */}

                                                    <td>

                                                        <div className="teams-name-cell">

                                                            <div className="teams-row-icon">
                                                                <UsersRound
                                                                    size={17}
                                                                />
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {team.name}
                                                                </strong>

                                                                <span>
                                                                    Internal Work Team
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* DEPARTMENT */}

                                                    <td>

                                                        {departmentName ===
                                                            "—" ? (
                                                            <span className="teams-muted">
                                                                —
                                                            </span>
                                                        ) : (
                                                            <span className="teams-department-chip">
                                                                <Building2
                                                                    size={13}
                                                                />

                                                                {
                                                                    departmentName
                                                                }
                                                            </span>
                                                        )}

                                                    </td>

                                                    {/* ID */}

                                                    <td>

                                                        <span className="teams-id">
                                                            TEAM-
                                                            {String(
                                                                team.id
                                                            ).padStart(
                                                                3,
                                                                "0"
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`teams-status ${team.isActive ===
                                                                    false
                                                                    ? "inactive"
                                                                    : "active"
                                                                }`}
                                                        >
                                                            <span />

                                                            {team.isActive ===
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