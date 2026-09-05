import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Laptop,
  Plus,
  Send,
  Tag,
  Ticket,
} from "lucide-react";

import api from "../api/client";

import "../styles/CreateTicketPage.css";

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

  const [
    loadingData,
    setLoadingData,
  ] =
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
    event: FormEvent
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
      <div className="create-ticket-loading">
        <div className="create-ticket-spinner" />

        <p>
          Loading ticket form...
        </p>
      </div>
    );
  }

  return (
    <div className="create-ticket-page">

      <button
        type="button"
        className="create-ticket-back"
        onClick={() =>
          navigate("/tickets")
        }
        disabled={saving}
      >
        <ArrowLeft size={16} />

        Back to Tickets
      </button>

      <section className="create-ticket-header">

        <div className="create-ticket-header-copy">

          <span className="create-ticket-eyebrow">
            IT SUPPORT
          </span>

          <h1>
            Create Ticket
          </h1>

          <p>
            Submit a new IT support request
            and provide the details needed
            by the support team.
          </p>

        </div>

        <div className="create-ticket-header-icon">
          <Ticket
            size={31}
            strokeWidth={1.7}
          />
        </div>

      </section>

      {error && (
        <div
          className="create-ticket-alert"
          role="alert"
        >
          <AlertTriangle size={17} />
          {error}
        </div>
      )}

      <form
        className="create-ticket-form-card"
        onSubmit={handleSubmit}
      >

        <section className="create-ticket-section">

          <div className="create-ticket-section-heading">

            <div className="create-ticket-section-icon">
              <FileText size={18} />
            </div>

            <div>
              <span>
                REQUEST DETAILS
              </span>

              <h2>
                Describe the Issue
              </h2>

              <p>
                Provide a clear title and
                enough detail for the IT team.
              </p>
            </div>

          </div>

          <div className="create-ticket-fields">

            <div className="create-ticket-field">

              <label htmlFor="ticket-title">
                Title
                <span>*</span>
              </label>

              <div className="create-ticket-input-shell">

                <Ticket size={16} />

                <input
                  id="ticket-title"
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

            </div>

            <div className="create-ticket-field">

              <label htmlFor="ticket-description">
                Description
                <span>*</span>
              </label>

              <div className="create-ticket-textarea-shell">

                <FileText size={16} />

                <textarea
                  id="ticket-description"
                  value={description}
                  placeholder="Describe the problem in detail..."
                  disabled={saving}
                  required
                  rows={7}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />

              </div>

              <small>
                Include what happened, when it
                started, and any error messages.
              </small>

            </div>

          </div>

        </section>

        <section className="create-ticket-section">

          <div className="create-ticket-section-heading">

            <div className="create-ticket-section-icon secondary">
              <Tag size={18} />
            </div>

            <div>
              <span>
                CLASSIFICATION
              </span>

              <h2>
                Ticket Information
              </h2>

              <p>
                Set the category, priority,
                and related asset.
              </p>
            </div>

          </div>

          <div className="create-ticket-grid">

            <div className="create-ticket-field">

              <label htmlFor="ticket-priority">
                Priority
              </label>

              <div className="create-ticket-select-shell">

                <AlertTriangle size={16} />

                <select
                  id="ticket-priority"
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

              <div
                className={`create-ticket-priority-badge ${priority.toLowerCase()}`}
              >
                {priority === "LOW" &&
                  "Low priority"}

                {priority === "MEDIUM" &&
                  "Normal response"}

                {priority === "HIGH" &&
                  "High priority"}

                {priority === "CRITICAL" &&
                  "Critical issue"}
              </div>

            </div>

            <div className="create-ticket-field">

              <label htmlFor="ticket-category">
                Category
                <span>*</span>
              </label>

              <div className="create-ticket-select-shell">

                <Tag size={16} />

                <select
                  id="ticket-category"
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
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

            <div className="create-ticket-field create-ticket-field-full">

              <label htmlFor="ticket-asset">
                Related Asset
              </label>

              <div className="create-ticket-select-shell">

                <Laptop size={16} />

                <select
                  id="ticket-asset"
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

              <small>
                Optional. Select the device
                affected by this issue.
              </small>

            </div>

          </div>

        </section>

        <div className="create-ticket-actions">

          <button
            type="button"
            className="create-ticket-cancel"
            disabled={saving}
            onClick={() =>
              navigate("/tickets")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-ticket-submit"
            disabled={
              saving ||
              !title.trim() ||
              !description.trim() ||
              !categoryId
            }
          >
            {saving ? (
              <>
                <span className="create-ticket-button-spinner" />
                Creating...
              </>
            ) : (
              <>
                <Send size={16} />
                Create Ticket
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
}