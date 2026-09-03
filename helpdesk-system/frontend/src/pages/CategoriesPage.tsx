import { useEffect, useState } from "react";
import api from "../api/client";

type Category = {
    id: number;
    name: string;
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const fetchCategories = async () => {
        try {
            setError("");

            const response = await api.get("/categories");

            setCategories(
                response.data.data.categories
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to load categories"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {
            setCreating(true);
            setError("");

            await api.post("/categories", {
                name: name.trim(),
            });

            setName("");

            await fetchCategories();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to create category"
            );
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <p>Loading categories...</p>;
    }

    return (
        <div>
            <div>
                <h1>Categories</h1>

                <p>
                    Manage IT support ticket categories.
                </p>
            </div>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label>Category Name</label>

                <input
                    type="text"
                    placeholder="Hardware"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

                <button
                    type="submit"
                    disabled={creating}
                >
                    {creating
                        ? "Adding..."
                        : "+ Add Category"}
                </button>
            </form>

            <hr />

            {categories.length === 0 ? (
                <p>No categories found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}