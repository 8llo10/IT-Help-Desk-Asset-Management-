import { useNavigate } from "react-router-dom";

import {
    Bell,
    LogOut,
    Search,
    ChevronDown,
} from "lucide-react";

export default function Navbar() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    const handleProfile = () => {
        navigate("/profile");
    };

    const initials =
        user.fullName
            ?.split(" ")
            .map((name: string) => name[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

    return (
        <header className="top-navbar">
            <div className="navbar-search">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search tickets, assets, users..."
                />
            </div>

            <div className="navbar-actions">
                <button
                    type="button"
                    className="navbar-icon-button"
                    title="Notifications"
                >
                    <Bell size={19} />

                    <span className="notification-dot" />
                </button>

                <div className="navbar-divider" />

                <button
                    type="button"
                    className="navbar-user"
                    onClick={handleProfile}
                    title="View profile"
                >
                    <div className="navbar-avatar">
                        {initials}
                    </div>

                    <div className="navbar-user-info">
                        <strong>
                            {user.fullName || "User"}
                        </strong>

                        <span>
                            {user.role || ""}
                        </span>
                    </div>

                    <ChevronDown size={16} />
                </button>

                <button
                    type="button"
                    className="navbar-logout"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}