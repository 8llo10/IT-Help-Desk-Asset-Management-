import {
    Link,
} from "react-router-dom";

import {
    BadgeCheck,
    Building2,
    CheckCircle2,
    Mail,
    ShieldCheck,
    Sparkles,
    User,
    UserPen,
} from "lucide-react";

import useAuth from "../hooks/useAuth";

import "../styles/ProfilePage.css";

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

const getAccessDescription = (
    role?: string
) => {
    switch (role) {
        case "ADMIN":
            return "Administrative access to WASL management features based on your assigned account role.";

        case "TECHNICIAN":
            return "Access to IT support operations, assigned tickets and technical workflows.";

        case "EMPLOYEE":
            return "Access to employee self-service features and support requests.";

        default:
            return "Your access is determined by the account role assigned in WASL.";
    }
};

export default function ProfilePage() {
    const {
        user,
        loading,
    } =
        useAuth();

    if (loading) {
        return (
            <div className="profile-loading">

                <div className="profile-loading-icon">
                    <User
                        size={24}
                    />
                </div>

                <strong>
                    Loading profile
                </strong>

                <p>
                    Preparing your WASL
                    account information...
                </p>

            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-unavailable">

                <div className="profile-unavailable-icon">
                    <User
                        size={25}
                    />
                </div>

                <h2>
                    Profile unavailable
                </h2>

                <p>
                    Your account information
                    could not be loaded.
                </p>

            </div>
        );
    }

    const initials =
        user.fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (name) =>
                    name[0]?.toUpperCase()
            )
            .join("");

    return (
        <div className="profile-page">

            {/* =====================================================
          HERO
          ===================================================== */}

            <section className="profile-hero">

                <div className="profile-hero-copy">

                    <div className="profile-eyebrow">
                        <span />
                        WASL ACCOUNT
                    </div>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View your account identity,
                        status and current access
                        information inside WASL.
                    </p>

                </div>

                <Link
                    to="/profile/edit"
                    className="profile-edit-button"
                >
                    <UserPen
                        size={16}
                    />

                    Edit Profile
                </Link>

            </section>

            {/* =====================================================
          IDENTITY
          ===================================================== */}

            <section className="profile-identity-card">

                <div className="profile-identity-main">

                    <div className="profile-avatar">
                        {initials || "U"}

                        {user.isActive && (
                            <span className="profile-avatar-status">
                                <CheckCircle2
                                    size={11}
                                />
                            </span>
                        )}
                    </div>

                    <div className="profile-identity-copy">

                        <span className="profile-identity-label">
                            ACCOUNT HOLDER
                        </span>

                        <h2>
                            {user.fullName}
                        </h2>

                        <p>
                            {user.email}
                        </p>

                        <div className="profile-identity-badges">

                            <span className="profile-role-badge">
                                <ShieldCheck
                                    size={14}
                                />

                                {formatRole(
                                    user.role
                                )}
                            </span>

                            <span
                                className={`profile-status-badge ${user.isActive
                                        ? "active"
                                        : "inactive"
                                    }`}
                            >
                                <span />

                                {user.isActive
                                    ? "Active Account"
                                    : "Inactive Account"}
                            </span>

                        </div>

                    </div>

                </div>

                <div className="profile-identity-side">

                    <span>
                        ACCOUNT OVERVIEW
                    </span>

                    <div className="profile-identity-side-row">

                        <span>
                            Base Role
                        </span>

                        <strong>
                            {formatRole(
                                user.role
                            )}
                        </strong>

                    </div>

                    <div className="profile-identity-side-row">

                        <span>
                            Account Status
                        </span>

                        <strong>
                            {user.isActive
                                ? "Active"
                                : "Inactive"}
                        </strong>

                    </div>

                </div>

            </section>

            {/* =====================================================
          CONTENT GRID
          ===================================================== */}

            <section className="profile-content-grid">

                {/* ===================================================
            ACCOUNT INFORMATION
            =================================================== */}

                <article className="profile-information-card">

                    <div className="profile-card-header">

                        <div className="profile-card-heading-icon">
                            <User
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                ACCOUNT DETAILS
                            </span>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Information associated
                                with your WASL account.
                            </p>

                        </div>

                    </div>

                    <div className="profile-information-list">

                        {/* NAME */}

                        <div className="profile-information-item">

                            <div className="profile-information-icon">
                                <User
                                    size={17}
                                />
                            </div>

                            <div>

                                <span>
                                    Full Name
                                </span>

                                <strong>
                                    {user.fullName}
                                </strong>

                            </div>

                        </div>

                        {/* EMAIL */}

                        <div className="profile-information-item">

                            <div className="profile-information-icon profile-information-icon-pink">
                                <Mail
                                    size={17}
                                />
                            </div>

                            <div>

                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    {user.email}
                                </strong>

                            </div>

                        </div>

                        {/* ROLE */}

                        <div className="profile-information-item">

                            <div className="profile-information-icon">
                                <ShieldCheck
                                    size={17}
                                />
                            </div>

                            <div>

                                <span>
                                    Base Role
                                </span>

                                <strong>
                                    {formatRole(
                                        user.role
                                    )}
                                </strong>

                            </div>

                        </div>

                        {/* STATUS */}

                        <div className="profile-information-item">

                            <div
                                className={`profile-information-icon ${user.isActive
                                        ? "profile-information-icon-success"
                                        : "profile-information-icon-muted"
                                    }`}
                            >
                                <BadgeCheck
                                    size={17}
                                />
                            </div>

                            <div>

                                <span>
                                    Account Status
                                </span>

                                <strong>
                                    {user.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </article>

                {/* ===================================================
            ACCESS
            =================================================== */}

                <article className="profile-access-card">

                    <div className="profile-card-header">

                        <div className="profile-card-heading-icon profile-card-heading-icon-pink">
                            <ShieldCheck
                                size={18}
                            />
                        </div>

                        <div>

                            <span>
                                ACCESS INFORMATION
                            </span>

                            <h2>
                                Current Access
                            </h2>

                            <p>
                                Your account's base
                                access level in WASL.
                            </p>

                        </div>

                    </div>

                    <div className="profile-access-panel">

                        <div className="profile-access-role">

                            <div className="profile-access-role-icon">
                                <Building2
                                    size={21}
                                />
                            </div>

                            <div>

                                <span>
                                    BASE ROLE
                                </span>

                                <h3>
                                    {formatRole(
                                        user.role
                                    )}
                                </h3>

                            </div>

                        </div>

                        <p className="profile-access-description">
                            {getAccessDescription(
                                user.role
                            )}
                        </p>

                        <div className="profile-access-note">

                            <Sparkles
                                size={15}
                            />

                            <div>

                                <strong>
                                    Managed access
                                </strong>

                                <p>
                                    Account roles and
                                    permissions are controlled
                                    by WASL administrators.
                                </p>

                            </div>

                        </div>

                    </div>

                </article>

            </section>

            {/* =====================================================
          EDIT CTA
          ===================================================== */}

            <section className="profile-edit-panel">

                <div>

                    <div className="profile-edit-panel-icon">
                        <UserPen
                            size={18}
                        />
                    </div>

                    <div>

                        <strong>
                            Need to update your profile?
                        </strong>

                        <p>
                            You can edit your personal
                            name from your profile settings.
                        </p>

                    </div>

                </div>

                <Link
                    to="/profile/edit"
                >
                    Edit Profile

                    <UserPen
                        size={15}
                    />
                </Link>

            </section>

        </div>
    );
}