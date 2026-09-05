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
    Check,
    CheckCircle2,
    Edit3,
    Layers3,
    Plus,
    Search,
    Sparkles,
    UsersRound,
    X,
} from "lucide-react";

import {
    createDepartment,
    getDepartments,
    updateDepartment,
} from "../api/departments.api";

import "../styles/DepartmentsPage.css";

interface Department {
    id: number;
    name: string;
}

export default function DepartmentsPage() {
    const [
        departments,
        setDepartments,
    ] =
        useState<Department[]>([]);

    const [name, setName] =
        useState("");

    const [
        search,
        setSearch,
    ] =
        useState("");

    const [
        editingId,
        setEditingId,
    ] =
        useState<number | null>(
            null
        );

    const [
        editingName,
        setEditingName,
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

    const fetchDepartments =
        async () => {
            try {
                setError("");

                const response =
                    await getDepartments();

                const data =
                    response.data?.data
                        ?.departments ??
                    response.data?.data ??
                    [];

                setDepartments(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error: any) {
                setError(
                    error.response?.data
                        ?.message ??
                    "Failed to load departments"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void fetchDepartments();
    }, []);

    /* =========================================================
       CREATE
       ========================================================= */

    const handleCreate = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            return;
        }

        const alreadyExists =
            departments.some(
                (department) =>
                    department.name
                        .trim()
                        .toLowerCase() ===
                    trimmedName.toLowerCase()
            );

        if (alreadyExists) {
            setError(
                "Department already exists."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await createDepartment({
                name: trimmedName,
            });

            setName("");

            setMessage(
                "Department created successfully."
            );

            await fetchDepartments();
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to create department"
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       EDIT
       ========================================================= */

    const startEditing = (
        department: Department
    ) => {
        setEditingId(
            department.id
        );

        setEditingName(
            department.name
        );

        setError("");
        setMessage("");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEditing = async (
        departmentId: number
    ) => {
        const trimmedName =
            editingName.trim();

        if (!trimmedName) {
            setError(
                "Department name is required."
            );

            return;
        }

        const alreadyExists =
            departments.some(
                (department) =>
                    department.id !==
                    departmentId &&
                    department.name
                        .trim()
                        .toLowerCase() ===
                    trimmedName.toLowerCase()
            );

        if (alreadyExists) {
            setError(
                "Department already exists."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await updateDepartment(
                departmentId,
                {
                    name:
                        trimmedName,
                }
            );

            setEditingId(null);
            setEditingName("");

            setMessage(
                "Department updated successfully."
            );

            await fetchDepartments();
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to update department"
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       FILTER
       ========================================================= */

    const filteredDepartments =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return departments;
            }

            return departments.filter(
                (department) =>
                    department.name
                        .toLowerCase()
                        .includes(query) ||
                    String(
                        department.id
                    ).includes(query)
            );
        }, [
            departments,
            search,
        ]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="departments-loading">

                <div className="departments-loader">
                    <Building2
                        size={25}
                    />
                </div>

                <strong>
                    Loading departments
                </strong>

                <p>
                    Preparing company structure...
                </p>

            </div>
        );
    }

    /* =========================================================
       UI
       ========================================================= */

    return (
        <div className="departments-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="departments-hero">

                <div className="departments-hero-copy">

                    <div className="departments-eyebrow">
                        <span />
                        ORGANIZATION STRUCTURE
                    </div>

                    <h1>
                        Departments
                    </h1>

                    <p>
                        Organize business units and
                        keep your IT support structure
                        aligned with the company.
                    </p>

                </div>

                <div className="departments-hero-stat">

                    <div className="departments-hero-icon">
                        <Layers3
                            size={24}
                        />
                    </div>

                    <div>

                        <span>
                            Total Departments
                        </span>

                        <strong>
                            {departments.length}
                        </strong>

                    </div>

                </div>

            </section>

            {/* =====================================================
          MESSAGES
          ===================================================== */}

            {error && (
                <div className="departments-alert departments-alert-error">

                    <X size={16} />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {message && (
                <div className="departments-alert departments-alert-success">

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

            <section className="departments-workspace">

                {/* CREATE */}

                <article className="departments-create-card">

                    <div className="departments-card-heading">

                        <div className="departments-heading-icon">
                            <Plus size={18} />
                        </div>

                        <div>

                            <span>
                                NEW DEPARTMENT
                            </span>

                            <h2>
                                Add Department
                            </h2>

                            <p>
                                Create a new organizational
                                unit for users and teams.
                            </p>

                        </div>

                    </div>

                    <form
                        className="departments-create-form"
                        onSubmit={
                            handleCreate
                        }
                    >

                        <label
                            htmlFor="department-name"
                        >
                            Department Name
                        </label>

                        <div className="departments-input-shell">

                            <Building2
                                size={17}
                            />

                            <input
                                id="department-name"
                                type="text"
                                placeholder="e.g. Information Technology"
                                value={name}
                                disabled={
                                    saving
                                }
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <button
                            type="submit"
                            className="departments-create-button"
                            disabled={
                                saving ||
                                !name.trim()
                            }
                        >
                            {saving ? (
                                <>
                                    <span className="departments-button-spinner" />

                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus
                                        size={16}
                                    />

                                    Add Department
                                </>
                            )}
                        </button>

                    </form>

                    <div className="departments-create-note">

                        <Sparkles
                            size={15}
                        />

                        <span>
                            Department names must be
                            unique across the organization.
                        </span>

                    </div>

                </article>

                {/* DIRECTORY */}

                <article className="departments-directory-card">

                    <div className="departments-directory-header">

                        <div>

                            <span className="departments-section-eyebrow">
                                COMPANY DIRECTORY
                            </span>

                            <h2>
                                Department Directory
                            </h2>

                            <p>
                                View and update existing
                                organizational departments.
                            </p>

                        </div>

                        <div className="departments-count-chip">
                            {departments.length}
                            {" "}
                            departments
                        </div>

                    </div>

                    {/* SEARCH */}

                    <div className="departments-toolbar">

                        <div className="departments-search">

                            <Search
                                size={16}
                            />

                            <input
                                type="search"
                                placeholder="Search departments..."
                                value={search}
                                onChange={(event) =>
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

                        <div className="departments-toolbar-info">

                            <UsersRound
                                size={15}
                            />

                            <span>
                                Organizational Units
                            </span>

                        </div>

                    </div>

                    {/* CONTENT */}

                    {filteredDepartments.length ===
                        0 ? (
                        <div className="departments-empty">

                            <div className="departments-empty-icon">
                                <Building2
                                    size={25}
                                />
                            </div>

                            <strong>
                                {search
                                    ? "No matching departments"
                                    : "No departments yet"}
                            </strong>

                            <p>
                                {search
                                    ? "Try another search term."
                                    : "Create your first department using the form."}
                            </p>

                        </div>
                    ) : (
                        <div className="departments-table-wrap">

                            <table className="departments-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Department ID
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th className="departments-action-column">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredDepartments.map(
                                        (
                                            department,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    department.id
                                                }
                                            >

                                                {/* DEPARTMENT */}

                                                <td>

                                                    <div className="departments-name-cell">

                                                        <div className="departments-row-icon">
                                                            <Building2
                                                                size={17}
                                                            />
                                                        </div>

                                                        {editingId ===
                                                            department.id ? (
                                                            <div className="departments-edit-shell">

                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        editingName
                                                                    }
                                                                    autoFocus
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        setEditingName(
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    onKeyDown={(
                                                                        event
                                                                    ) => {
                                                                        if (
                                                                            event.key ===
                                                                            "Enter"
                                                                        ) {
                                                                            event.preventDefault();

                                                                            void saveEditing(
                                                                                department.id
                                                                            );
                                                                        }

                                                                        if (
                                                                            event.key ===
                                                                            "Escape"
                                                                        ) {
                                                                            cancelEditing();
                                                                        }
                                                                    }}
                                                                />

                                                            </div>
                                                        ) : (
                                                            <div className="departments-name-copy">

                                                                <strong>
                                                                    {
                                                                        department.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    Organizational Department
                                                                </span>

                                                            </div>
                                                        )}

                                                    </div>

                                                </td>

                                                {/* ID */}

                                                <td>

                                                    <span className="departments-id">
                                                        DEP-
                                                        {String(
                                                            department.id
                                                        ).padStart(
                                                            3,
                                                            "0"
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span className="departments-status">

                                                        <span />

                                                        Active

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="departments-actions">

                                                        {editingId ===
                                                            department.id ? (
                                                            <>

                                                                <button
                                                                    type="button"
                                                                    className="departments-save-button"
                                                                    title="Save changes"
                                                                    disabled={
                                                                        saving ||
                                                                        !editingName.trim()
                                                                    }
                                                                    onClick={() =>
                                                                        void saveEditing(
                                                                            department.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Check
                                                                        size={15}
                                                                    />

                                                                    Save
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="departments-cancel-button"
                                                                    title="Cancel"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={
                                                                        cancelEditing
                                                                    }
                                                                >
                                                                    <X
                                                                        size={15}
                                                                    />
                                                                </button>

                                                            </>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="departments-edit-button"
                                                                onClick={() =>
                                                                    startEditing(
                                                                        department
                                                                    )
                                                                }
                                                            >
                                                                <Edit3
                                                                    size={14}
                                                                />

                                                                Edit
                                                            </button>
                                                        )}

                                                    </div>

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