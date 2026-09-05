import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    Mail,
    Save,
    ShieldCheck,
    User,
} from "lucide-react";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

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
        event: React.FormEvent
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
        } catch (error: any) {
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
            <p>
                Loading profile...
            </p>
        );
    }

    if (!user) {
        return (
            <div>
                <p>
                    Profile information is
                    unavailable.
                </p>

                <Link to="/dashboard">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="edit-profile-page">

            {/* HEADER */}

            <section>
                <div>
                    <Link
                        to="/profile"
                    >
                        <ArrowLeft
                            size={17}
                        />

                        Back to Profile
                    </Link>

                    <h1>
                        Edit Profile
                    </h1>

                    <p>
                        Update your personal WASL
                        account information.
                    </p>
                </div>
            </section>

            {/* MESSAGES */}

            {error && (
                <div>
                    <p>
                        {error}
                    </p>
                </div>
            )}

            {message && (
                <div>
                    <p>
                        {message}
                    </p>
                </div>
            )}

            {/* FORM */}

            <form
                onSubmit={
                    handleSubmit
                }
            >

                {/* FULL NAME */}

                <div>
                    <label
                        htmlFor="fullName"
                    >
                        Full Name
                    </label>

                    <div>
                        <User
                            size={18}
                        />

                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            placeholder="Your full name"
                            autoComplete="name"
                            required
                            disabled={saving}
                            onChange={(event) => {
                                setFullName(
                                    event.target.value
                                );

                                setError("");
                                setMessage("");
                            }}
                        />
                    </div>
                </div>

                {/* EMAIL */}

                <div>
                    <label
                        htmlFor="email"
                    >
                        Email Address
                    </label>

                    <div>
                        <Mail
                            size={18}
                        />

                        <input
                            id="email"
                            type="email"
                            value={
                                user.email
                            }
                            disabled
                        />
                    </div>

                    <small>
                        Your email address is
                        managed by the system.
                    </small>
                </div>

                {/* ROLE */}

                <div>
                    <label
                        htmlFor="role"
                    >
                        Base Role
                    </label>

                    <div>
                        <ShieldCheck
                            size={18}
                        />

                        <input
                            id="role"
                            type="text"
                            value={formatRole(
                                user.role
                            )}
                            disabled
                        />
                    </div>

                    <small>
                        Roles and permissions are
                        managed by an administrator.
                    </small>
                </div>

                {/* STATUS */}

                <div>
                    <label
                        htmlFor="status"
                    >
                        Account Status
                    </label>

                    <input
                        id="status"
                        type="text"
                        value={
                            user.isActive
                                ? "Active"
                                : "Inactive"
                        }
                        disabled
                    />
                </div>

                {/* ACTIONS */}

                <div>
                    <button
                        type="submit"
                        disabled={
                            saving ||
                            !fullName.trim()
                        }
                    >
                        <Save
                            size={17}
                        />

                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                            navigate(
                                "/profile"
                            )
                        }
                    >
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
}