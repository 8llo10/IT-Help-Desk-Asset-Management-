import {
    Link,
} from "react-router-dom";

import {
    BadgeCheck,
    Building2,
    Mail,
    ShieldCheck,
    User,
    UserPen,
} from "lucide-react";

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

export default function ProfilePage() {
    const {
        user,
        loading,
    } = useAuth();

    if (loading) {
        return (
            <div>
                <p>
                    Loading profile...
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <p>
                    Profile information is
                    unavailable.
                </p>
            </div>
        );
    }

    const initials =
        user.fullName
            .split(" ")
            .filter(Boolean)
            .map(
                (name) =>
                    name[0]
            )
            .slice(0, 2)
            .join("")
            .toUpperCase();

    return (
        <div className="profile-page">

            {/* HEADER */}

            <section className="profile-header">
                <div>
                    <p>
                        Account
                    </p>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View your WASL account
                        information and access
                        details.
                    </p>
                </div>

                <Link
                    to="/profile/edit"
                >
                    <UserPen
                        size={18}
                    />

                    Edit Profile
                </Link>
            </section>

            {/* PROFILE SUMMARY */}

            <section className="profile-summary">

                <div className="profile-avatar">
                    {initials || "U"}
                </div>

                <div>
                    <h2>
                        {user.fullName}
                    </h2>

                    <p>
                        {user.email}
                    </p>

                    <div>
                        <span>
                            <ShieldCheck
                                size={15}
                            />

                            {formatRole(
                                user.role
                            )}
                        </span>

                        <span>
                            <BadgeCheck
                                size={15}
                            />

                            {user.isActive
                                ? "Active Account"
                                : "Inactive Account"}
                        </span>
                    </div>
                </div>

            </section>

            {/* ACCOUNT INFORMATION */}

            <section>
                <div>
                    <h2>
                        Account Information
                    </h2>

                    <p>
                        Your personal account
                        details in WASL.
                    </p>
                </div>

                <div>

                    <article>
                        <User
                            size={19}
                        />

                        <div>
                            <span>
                                Full Name
                            </span>

                            <strong>
                                {user.fullName}
                            </strong>
                        </div>
                    </article>

                    <article>
                        <Mail
                            size={19}
                        />

                        <div>
                            <span>
                                Email Address
                            </span>

                            <strong>
                                {user.email}
                            </strong>
                        </div>
                    </article>

                    <article>
                        <ShieldCheck
                            size={19}
                        />

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
                    </article>

                    <article>
                        <BadgeCheck
                            size={19}
                        />

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
                    </article>

                </div>
            </section>

            {/* ACCESS INFORMATION */}

            <section>
                <div>
                    <h2>
                        Access Information
                    </h2>

                    <p>
                        Your current access level
                        inside WASL.
                    </p>
                </div>

                <div>
                    <Building2
                        size={20}
                    />

                    <div>
                        <strong>
                            {formatRole(
                                user.role
                            )}
                        </strong>

                        <p>
                            {user.role ===
                                "ADMIN"
                                ? "Full administrative access to WASL management features."
                                : user.role ===
                                    "TECHNICIAN"
                                    ? "Access to IT support operations, assigned tickets and technical workflows."
                                    : "Access to employee self-service features and support requests."}
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
}