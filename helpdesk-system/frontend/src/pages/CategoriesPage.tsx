import {
    useEffect,
    useState,
} from "react";

import {
    createCategory,
    getCategories,
    updateCategory,
} from "../api/categories.api";

interface Category {
    id: number;
    name: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] =
        useState<Category[]>([]);

    const [name, setName] =
        useState("");

    const [
        editingId,
        setEditingId,
    ] = useState<number | null>(
        null
    );

    const [
        editingName,
        setEditingName,
    ] = useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const fetchCategories =
        async () => {
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

    const handleCreate = async (
        event: React.FormEvent
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

    if (loading) {
        return (
            <p>
                Loading categories...
            </p>
        );
    }

    return (
        <div>

            <div>
                <h1>
                    Categories
                </h1>

                <p>
                    Manage IT support
                    ticket categories.
                </p>

                <p>
                    Total:{" "}
                    {categories.length}
                </p>
            </div>

            {error && (
                <p>
                    {error}
                </p>
            )}

            {message && (
                <p>
                    {message}
                </p>
            )}

            <form
                onSubmit={
                    handleCreate
                }
            >
                <label>
                    Category Name
                </label>

                <input
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

                <button
                    type="submit"
                    disabled={
                        saving ||
                        !name.trim()
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Add Category"}
                </button>
            </form>

            <hr />

            {categories.length === 0 ? (
                <p>
                    No categories found.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>
                                ID
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories.map(
                            (category) => (
                                <tr
                                    key={
                                        category.id
                                    }
                                >
                                    <td>
                                        {
                                            category.id
                                        }
                                    </td>

                                    <td>
                                        {editingId ===
                                            category.id ? (
                                            <input
                                                type="text"
                                                value={
                                                    editingName
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
                                                disabled={
                                                    saving
                                                }
                                            />
                                        ) : (
                                            category.name
                                        )}
                                    </td>

                                    <td>
                                        {editingId ===
                                            category.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        saving
                                                    }
                                                    onClick={() =>
                                                        void saveEditing(
                                                            category.id
                                                        )
                                                    }
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        saving
                                                    }
                                                    onClick={
                                                        cancelEditing
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditing(
                                                        category
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            )}

        </div>
    );
}