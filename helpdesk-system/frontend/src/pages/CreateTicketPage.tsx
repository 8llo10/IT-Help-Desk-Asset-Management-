import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

interface Category {
  id: number;
  name: string;
}

interface Asset {
  id: number;
  assetTag: string;
  type: string;
  brand?: string | null;
  model?: string | null;
}

export default function CreateTicketPage() {
  const navigate =
    useNavigate();

  const [
    categories,
    setCategories,
  ] =
    useState<Category[]>([]);

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    priority,
    setPriority,
  ] =
    useState<TicketPriority>(
      "MEDIUM"
    );

  const [
    categoryId,
    setCategoryId,
  ] =
    useState("");

  const [assetId, setAssetId] =
    useState("");

  const [loadingData, setLoadingData] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");

        const [
          categoriesResponse,
          assetsResponse,
        ] =
          await Promise.all([
            api.get(
              "/categories"
            ),

            api.get(
              "/assets"
            ),
          ]);

        const categoriesData =
          categoriesResponse.data
            ?.data?.categories ??
          categoriesResponse.data
            ?.data ??
          [];

        const assetsData =
          assetsResponse.data?.data
            ?.assets ??
          assetsResponse.data?.data ??
          [];

        setCategories(
          Array.isArray(
            categoriesData
          )
            ? categoriesData
            : []
        );

        setAssets(
          Array.isArray(
            assetsData
          )
            ? assetsData
            : []
        );
      } catch (error: any) {
        setError(
          error.response?.data
            ?.message ??
          "Failed to load form data"
        );
      } finally {
        setLoadingData(false);
      }
    };

    void loadData();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      setError(
        "Ticket title is required."
      );

      return;
    }

    if (!description.trim()) {
      setError(
        "Description is required."
      );

      return;
    }

    if (!categoryId) {
      setError(
        "Please select a category."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post(
        "/tickets",
        {
          title:
            title.trim(),

          description:
            description.trim(),

          priority,

          categoryId:
            Number(categoryId),

          ...(assetId
            ? {
              assetId:
                Number(assetId),
            }
            : {}),
        }
      );

      navigate(
        "/tickets"
      );
    } catch (error: any) {
      setError(
        error.response?.data
          ?.message ??
        "Failed to create ticket"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <p>
        Loading ticket form...
      </p>
    );
  }

  return (
    <div>
      <h1>
        Create Ticket
      </h1>

      <p>
        Submit a new IT support
        request.
      </p>

      {error && (
        <p>{error}</p>
      )}

      <form
        onSubmit={
          handleSubmit
        }
      >
        <div>
          <label>
            Title
          </label>

          <input
            type="text"
            value={title}
            placeholder="Brief description of the issue"
            disabled={saving}
            required
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
          />
        </div>

        <div>
          <label>
            Description
          </label>

          <textarea
            value={description}
            placeholder="Describe the problem in detail..."
            disabled={saving}
            required
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
          />
        </div>

        <div>
          <label>
            Priority
          </label>

          <select
            value={priority}
            disabled={saving}
            onChange={(event) =>
              setPriority(
                event.target
                  .value as TicketPriority
              )
            }
          >
            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="CRITICAL">
              Critical
            </option>
          </select>
        </div>

        <div>
          <label>
            Category
          </label>

          <select
            value={categoryId}
            disabled={saving}
            required
            onChange={(event) =>
              setCategoryId(
                event.target.value
              )
            }
          >
            <option value="">
              Select Category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label>
            Related Asset
          </label>

          <select
            value={assetId}
            disabled={saving}
            onChange={(event) =>
              setAssetId(
                event.target.value
              )
            }
          >
            <option value="">
              No Asset
            </option>

            {assets.map(
              (asset) => (
                <option
                  key={asset.id}
                  value={asset.id}
                >
                  {asset.assetTag} -{" "}
                  {asset.type}
                  {asset.brand
                    ? ` - ${asset.brand}`
                    : ""}
                  {asset.model
                    ? ` ${asset.model}`
                    : ""}
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={
            saving ||
            !title.trim() ||
            !description.trim() ||
            !categoryId
          }
        >
          {saving
            ? "Creating..."
            : "Create Ticket"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            navigate("/tickets")
          }
        >
          Cancel
        </button>
      </form>
    </div>
  );
}