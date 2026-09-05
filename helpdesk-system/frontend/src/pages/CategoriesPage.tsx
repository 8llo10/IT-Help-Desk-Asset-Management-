import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    Check,
    CheckCircle2,
    Edit3,
    FolderCog,
    Plus,
    Search,
    Tags,
    X,
} from "lucide-react";

import {
    createCategory,
    getCategories,
    updateCategory,
} from "../api/categories.api";

import "../styles/CategoriesPage.css";

interface Category {
    id: number;
    name: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] =
        useState<Category[]>([]);

    const [name, setName] =
        useState("");

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [editingName, setEditingName] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    /* =========================================================
       FETCH
       ========================================================= */

    const fetchCategories = async () => {
        try {
            setError("");

            const response =
                await getCategories();

            const data =
                response.data?.data
                    ?.categories ??
                response.data?.data ??
                [];

            setCategories(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to load categories"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchCategories();
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
            categories.some(
                (category) =>
                    category.name
                        .trim()
                        .toLowerCase() ===
                    trimmedName.toLowerCase()
            );

        if (alreadyExists) {
            setError(
                "Category already exists."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await createCategory({
                name: trimmedName,
            });

            setName("");

            setMessage(
                "Category created successfully."
            );

            await fetchCategories();
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to create category"
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       EDIT
       ========================================================= */

    const startEditing = (
        category: Category
    ) => {
        setEditingId(
            category.id
        );

        setEditingName(
            category.name
        );

        setError("");
        setMessage("");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEditing = async (
        categoryId: number
    ) => {
        const trimmedName =
            editingName.trim();

        if (!trimmedName) {
            setError(
                "Category name is required."
            );

            return;
        }

        const alreadyExists =
            categories.some(
                (category) =>
                    category.id !==
                    categoryId &&
                    category.name
                        .trim()
                        .toLowerCase() ===
                    trimmedName.toLowerCase()
            );

        if (alreadyExists) {
            setError(
                "Category already exists."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await updateCategory(
                categoryId,
                {
                    name: trimmedName,
                }
            );

            setEditingId(null);
            setEditingName("");

            setMessage(
                "Category updated successfully."
            );

            await fetchCategories();
        } catch (error: any) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to update category"
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       SEARCH
       ========================================================= */

    const filteredCategories =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return categories;
            }

            return categories.filter(
                (category) =>
                    category.name
                        .toLowerCase()
                        .includes(query) ||
                    String(category.id)
                        .includes(query)
            );
        }, [
            categories,
            search,
        ]);

    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="categories-loading">

                <div className="categories-spinner" />

                <p>
                    Loading categories...
                </p>

            </div>
        );
    }

    /* =========================================================
       PAGE
       ========================================================= */

    return (
        <div className="categories-page">

            {/* HEADER */}

            <section className="categories-header">

                <div>

                    <span className="categories-eyebrow">
                        TICKET MANAGEMENT
                    </span>

                    <h1>
                        Categories
                    </h1>

                    <p>
                        Organize IT support requests
                        into clear and manageable
                        categories.
                    </p>

                </div>

                <div className="categories-header-icon">
                    <Tags
                        size={29}
                        strokeWidth={1.7}
                    />
                </div>

            </section>

            {/* SUMMARY */}

            <section className="categories-summary">

                <div className="categories-summary-card">

                    <div className="categories-summary-icon">
                        <Tags size={20} />
                    </div>

                    <div>
                        <span>
                            Total Categories
                        </span>

                        <strong>
                            {categories.length}
                        </strong>

                        <p>
                            Available ticket categories
                        </p>
                    </div>

                </div>

                <div className="categories-summary-info">

                    <FolderCog size={20} />

                    <div>
                        <strong>
                            Support Classification
                        </strong>

                        <span>
                            Categories help route and
                            organize incoming IT tickets.
                        </span>
                    </div>

                </div>

            </section>

            {/* MESSAGES */}

            {error && (
                <div
                    className="categories-alert error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {message && (
                <div
                    className="categories-alert success"
                    role="status"
                >
                    <CheckCircle2 size={17} />

                    {message}
                </div>
            )}

            {/* CREATE */}

            <section className="categories-create-card">

                <div className="categories-card-heading">

                    <div className="categories-heading-icon">
                        <Plus size={18} />
                    </div>

                    <div>

                        <span>
                            NEW CATEGORY
                        </span>

                        <h2>
                            Add Category
                        </h2>

                        <p>
                            Create a new classification
                            for IT support tickets.
                        </p>

                    </div>

                </div>

                <form
                    className="categories-create-form"
                    onSubmit={handleCreate}
                >

                    <div className="categories-field">

                        <label htmlFor="category-name">
                            Category Name
                        </label>

                        <div className="categories-input-shell">

                            <Tags size={17} />

                            <input
                                id="category-name"
                                type="text"
                                placeholder="Hardware"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                disabled={saving}
                            />

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="categories-add-button"
                        disabled={
                            saving ||
                            !name.trim()
                        }
                    >
                        {saving ? (
                            <>
                                <span className="categories-button-spinner" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus size={17} />
                                Add Category
                            </>
                        )}
                    </button>

                </form>

            </section>

            {/* LIST */}

            <section className="categories-list-card">

                <div className="categories-list-header">

                    <div>

                        <span>
                            CATEGORY DIRECTORY
                        </span>

                        <h2>
                            Ticket Categories
                        </h2>

                        <p>
                            View and manage the categories
                            currently available.
                        </p>

                    </div>

                    <div className="categories-search">

                        <Search size={17} />

                        <input
                            type="search"
                            placeholder="Search categories..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>

                {filteredCategories.length === 0 ? (
                    <div className="categories-empty">

                        <div className="categories-empty-icon">
                            <Tags size={27} />
                        </div>

                        <h3>
                            No categories found
                        </h3>

                        <p>
                            {search
                                ? "No category matches your search."
                                : "Create your first ticket category."}
                        </p>

                    </div>
                ) : (
                    <div className="categories-table-wrapper">

                        <table className="categories-table">

                            <thead>
                                <tr>
                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        ID
                                    </th>

                                    <th className="categories-actions-heading">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredCategories.map(
                                    (
                                        category,
                                        index
                                    ) => {
                                        const isEditing =
                                            editingId ===
                                            category.id;

                                        return (
                                            <tr
                                                key={category.id}
                                                style={{
                                                    animationDelay:
                                                        `${index * 35}ms`,
                                                }}
                                            >

                                                <td>

                                                    <div className="categories-name-cell">

                                                        <div className="categories-row-icon">
                                                            <Tags size={16} />
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="categories-edit-input">

                                                                <input
                                                                    type="text"
                                                                    value={editingName}
                                                                    autoFocus
                                                                    onChange={(event) =>
                                                                        setEditingName(
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    onKeyDown={(event) => {
                                                                        if (
                                                                            event.key ===
                                                                            "Enter"
                                                                        ) {
                                                                            event.preventDefault();

                                                                            void saveEditing(
                                                                                category.id
                                                                            );
                                                                        }

                                                                        if (
                                                                            event.key ===
                                                                            "Escape"
                                                                        ) {
                                                                            cancelEditing();
                                                                        }
                                                                    }}
                                                                    disabled={saving}
                                                                />

                                                            </div>
                                                        ) : (
                                                            <div className="categories-name-copy">

                                                                <strong>
                                                                    {category.name}
                                                                </strong>

                                                                <span>
                                                                    IT Support Category
                                                                </span>

                                                            </div>
                                                        )}

                                                    </div>

                                                </td>

                                                <td>
                                                    <span className="categories-id">
                                                        #{category.id}
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="categories-actions">

                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="categories-action save"
                                                                    disabled={saving}
                                                                    onClick={() =>
                                                                        void saveEditing(
                                                                            category.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Check size={15} />
                                                                    Save
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="categories-action cancel"
                                                                    disabled={saving}
                                                                    onClick={
                                                                        cancelEditing
                                                                    }
                                                                >
                                                                    <X size={15} />
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="categories-action edit"
                                                                onClick={() =>
                                                                    startEditing(
                                                                        category
                                                                    )
                                                                }
                                                            >
                                                                <Edit3 size={15} />
                                                                Edit
                                                            </button>
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

                <div className="categories-list-footer">
                    Showing{" "}
                    <strong>
                        {filteredCategories.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {categories.length}
                    </strong>{" "}
                    categories
                </div>

            </section>

        </div>
    );
}