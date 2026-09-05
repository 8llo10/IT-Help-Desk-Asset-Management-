import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    ArrowLeft,
    BadgeCheck,
    CheckCircle2,
    LockKeyhole,
    Mail,
    Save,
    ShieldCheck,
    Sparkles,
    User,
    UserRoundCog,
    XCircle,
} from "lucide-react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

import "../styles/EditProfilePage.css";

const formatRole = (
    role?: string
) => {
    switch (role) {
        case "ADMIN":
            return "Administrator";

        case "TECHNICIAN":
            return "IT Technician";

        case "EMPLOYEE":
            return "Employee";

        default:
            return "—";
    }
};

export default function EditProfilePage() {
    const navigate =
        useNavigate();

    const {
        user,
        loading,
        refreshUser,
    } =
        useAuth();

    const [
        fullName,
        setFullName,
    ] =
        useState("");

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

    useEffect(() => {
        if (user) {
            setFullName(
                user.fullName
            );
        }
    }, [user]);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (!user) {
            return;
        }

        const normalizedName =
            fullName.trim();

        if (!normalizedName) {
            setError(
                "Full name is required."
            );

            return;
        }

        if (
            normalizedName ===
            user.fullName
        ) {
            setError("");

            setMessage(
                "No changes to save."
            );

            return;
        }

        try {
            setSaving(true);

            setError("");
            setMessage("");

            await api.patch(
                `/users/${user.id}`,
                {
                    fullName:
                        normalizedName,
                }
            );

            await refreshUser();

            setMessage(
                "Profile updated successfully."
            );
        } catch (
        error: any
        ) {
            setError(
                error.response?.data
                    ?.message ??
                "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-profile-loading">

                <div className="edit-profile-loading-icon">
                    <UserRoundCog
                        size={25}
                    />
                </div>

                <strong>
                    Loading your profile
                </strong>

                <p>
                    Preparing account information...
                </p>

            </div>
        );
    }

    if (!user) {
        return (
            <div className="edit-profile-unavailable">

                <div className="edit-profile-unavailable-icon">
                    <XCircle
                        size={27}
                    />
                </div>

                <h2>
                    Profile unavailable
                </h2>

                <p>
                    Profile information could
                    not be loaded.
                </p>

                <Link
                    to="/dashboard"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Back to Dashboard
                </Link>

            </div>
        );
    }

    const initials =
        user.fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part[0]?.toUpperCase()
            )
            .join("");

    return (
        <div className="edit-profile-page">

            {/* =====================================================
          BACK
          ===================================================== */}

            <Link
                to="/profile"
                className="edit-profile-back"
            >
                <ArrowLeft
                    size={15}
                />

                Back to Profile
            </Link>

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="edit-profile-hero">

                <div className="edit-profile-hero-main">

                    <div className="edit-profile-avatar">
                        {initials || "U"}
                    </div>

                    <div>

                        <div className="edit-profile-eyebrow">
                            ACCOUNT SETTINGS
                        </div>

                        <h1>
                            Edit Profile
                        </h1>

                        <p>
                            Manage the personal
                            information attached to
                            your WASL account.
                        </p>

                    </div>

                </div>

                <div className="edit-profile-hero-meta">

                    <div className="edit-profile-hero-meta-row">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            {user.email}
                        </strong>

                    </div>

                    <div className="edit-profile-hero-meta-row">

                        <span>
                            Account role
                        </span>

                        <strong>
                            {formatRole(
                                user.role
                            )}
                        </strong>

                    </div>

                </div>

            </section>

            {/* =====================================================
          MESSAGES
          ===================================================== */}

            {error && (
                <div className="edit-profile-alert edit-profile-alert-error">

                    <XCircle
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {message && (
                <div className="edit-profile-alert edit-profile-alert-success">

                    <CheckCircle2
                        size={16}
                    />

                    <span>
                        {message}
                    </span>

                </div>
            )}

            {/* =====================================================
          CONTENT
          ===================================================== */}

            <form
                className="edit-profile-layout"
                onSubmit={
                    handleSubmit
                }
            >

                {/* ===================================================
            MAIN EDIT AREA
            =================================================== */}

                <section className="edit-profile-main-card">

                    <div className="edit-profile-card-header">

                        <div className="edit-profile-card-icon">
                            <UserRoundCog
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                PERSONAL INFORMATION
                            </span>

                            <h2>
                                Profile Details
                            </h2>

                            <p>
                                Update the information
                                visible across WASL.
                            </p>

                        </div>

                    </div>

                    <div className="edit-profile-fields">

                        {/* FULL NAME */}

                        <div className="edit-profile-field">

                            <label
                                htmlFor="fullName"
                            >
                                Full Name
                                <b>*</b>
                            </label>

                            <div className="edit-profile-input-shell">

                                <User
                                    size={17}
                                />

                                <input
                                    id="fullName"
                                    type="text"
                                    value={
                                        fullName
                                    }
                                    placeholder="Your full name"
                                    autoComplete="name"
                                    required
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setFullName(
                                            event.target.value
                                        );

                                        setError("");
                                        setMessage("");
                                    }}
                                />

                            </div>

                            <small>
                                This name is shown
                                throughout the system.
                            </small>

                        </div>

                        {/* EMAIL */}

                        <div className="edit-profile-field">

                            <label
                                htmlFor="email"
                            >
                                Email Address
                            </label>

                            <div className="edit-profile-input-shell edit-profile-input-locked">

                                <Mail
                                    size={17}
                                />

                                <input
                                    id="email"
                                    type="email"
                                    value={
                                        user.email
                                    }
                                    disabled
                                />

                                <LockKeyhole
                                    size={14}
                                    className="edit-profile-lock-icon"
                                />

                            </div>

                            <small>
                                Email is managed
                                centrally by the system.
                            </small>

                        </div>

                        {/* ROLE */}

                        <div className="edit-profile-field">

                            <label
                                htmlFor="role"
                            >
                                Base Role
                            </label>

                            <div className="edit-profile-input-shell edit-profile-input-locked">

                                <ShieldCheck
                                    size={17}
                                />

                                <input
                                    id="role"
                                    type="text"
                                    value={
                                        formatRole(
                                            user.role
                                        )
                                    }
                                    disabled
                                />

                                <LockKeyhole
                                    size={14}
                                    className="edit-profile-lock-icon"
                                />

                            </div>

                            <small>
                                Roles and permissions
                                are managed by an
                                administrator.
                            </small>

                        </div>

                        {/* STATUS */}

                        <div className="edit-profile-field">

                            <label>
                                Account Status
                            </label>

                            <div className="edit-profile-status-card">

                                <div
                                    className={`edit-profile-status-icon ${user.isActive
                                            ? "active"
                                            : "inactive"
                                        }`}
                                >
                                    <BadgeCheck
                                        size={18}
                                    />
                                </div>

                                <div>

                                    <span>
                                        Current status
                                    </span>

                                    <strong>
                                        {user.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </strong>

                                </div>

                                <div
                                    className={`edit-profile-status-pill ${user.isActive
                                            ? "active"
                                            : "inactive"
                                        }`}
                                >
                                    <span />

                                    {user.isActive
                                        ? "Enabled"
                                        : "Disabled"}
                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ===================================================
            SIDE PANEL
            =================================================== */}

                <aside className="edit-profile-side-card">

                    <div className="edit-profile-side-top">

                        <div className="edit-profile-side-avatar">
                            {initials || "U"}
                        </div>

                        <div>

                            <span>
                                PROFILE PREVIEW
                            </span>

                            <strong>
                                {fullName.trim() ||
                                    user.fullName}
                            </strong>

                            <p>
                                {user.email}
                            </p>

                        </div>

                    </div>

                    <div className="edit-profile-side-divider" />

                    <div className="edit-profile-side-detail">

                        <div>
                            <ShieldCheck
                                size={16}
                            />

                            <span>
                                Role
                            </span>
                        </div>

                        <strong>
                            {formatRole(
                                user.role
                            )}
                        </strong>

                    </div>

                    <div className="edit-profile-side-detail">

                        <div>
                            <BadgeCheck
                                size={16}
                            />

                            <span>
                                Status
                            </span>
                        </div>

                        <strong>
                            {user.isActive
                                ? "Active"
                                : "Inactive"}
                        </strong>

                    </div>

                    <div className="edit-profile-side-note">

                        <Sparkles
                            size={16}
                        />

                        <div>

                            <strong>
                                Controlled account fields
                            </strong>

                            <p>
                                Email, role and account
                                status are protected
                                administrative settings.
                            </p>

                        </div>

                    </div>

                </aside>

                {/* ===================================================
            ACTION BAR
            =================================================== */}

                <div className="edit-profile-actions">

                    <div className="edit-profile-actions-copy">

                        <ShieldCheck
                            size={17}
                        />

                        <div>

                            <strong>
                                Profile changes
                            </strong>

                            <span>
                                Your updated name will
                                appear across WASL after
                                saving.
                            </span>

                        </div>

                    </div>

                    <div className="edit-profile-buttons">

                        <button
                            type="button"
                            className="edit-profile-cancel"
                            disabled={
                                saving
                            }
                            onClick={() =>
                                navigate(
                                    "/profile"
                                )
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-profile-save"
                            disabled={
                                saving ||
                                !fullName.trim()
                            }
                        >
                            {saving ? (
                                <>
                                    <span className="edit-profile-spinner" />

                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save
                                        size={16}
                                    />

                                    Save Changes
                                </>
                            )}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}