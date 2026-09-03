import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

type Category = {
  id: number;
  name: string;
};

type Asset = {
  id: number;
  assetTag: string;
  type: string;
};

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [categoryId, setCategoryId] = useState("");
  const [assetId, setAssetId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResponse, assetsResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/assets"),
        ]);

        setCategories(
          categoriesResponse.data.data.categories
        );

        setAssets(
          assetsResponse.data.data.assets
        );
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load form data"
        );
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/tickets", {
        title: title.trim(),
        description: description.trim(),
        priority,
        categoryId: Number(categoryId),
        ...(assetId && {
          assetId: Number(assetId),
        }),
      });

      navigate("/tickets");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to create ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Ticket</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Priority</label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">
              Critical
            </option>
          </select>
        </div>

        <div>
          <label>Category</label>

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            required
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Asset</label>

          <select
            value={assetId}
            onChange={(e) =>
              setAssetId(e.target.value)
            }
          >
            <option value="">
              No asset
            </option>

            {assets.map((asset) => (
              <option
                key={asset.id}
                value={asset.id}
              >
                {asset.assetTag} - {asset.type}
              </option>
            ))}
          </select>
        </div>

        {error && <p>{error}</p>}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}