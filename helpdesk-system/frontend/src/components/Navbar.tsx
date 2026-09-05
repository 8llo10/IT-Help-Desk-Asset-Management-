import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    Bell,
    ChevronDown,
    LogOut,
    Search,
    User,
    UserPen,
} from "lucide-react";

import useAuth from "../hooks/useAuth";

export default function Navbar() {
    const navigate = useNavigate();

    const {
        user,
        logout,
    } = useAuth();

    const [menuOpen, setMenuOpen] =
        useState(false);

    const menuRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (
            event: MouseEvent
        ) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node
                )
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const handleLogout = () => {
        logout();

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };

    const initials =
        user?.fullName
            ?.split(" ")
            .filter(Boolean)
            .map((name) => name[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

    const roleLabel = {
        ADMIN: "Administrator",
        TECHNICIAN: "IT Technician",
        EMPLOYEE: "Employee",
    }[user?.role ?? "EMPLOYEE"];

    return (
        <header className="top-navbar">

            <div className="navbar-search">
                <Search size={18} />

                <input
                    type="search"
                    placeholder="Search WASL..."
                    aria-label="Search"
                />
            </div>

            <div className="navbar-actions">

                <button
                    type="button"
                    className="navbar-icon-button"
                    title="Notifications"
                    onClick={() =>
                        navigate("/notifications")
                    }
                >
                    <Bell size={19} />
                </button>

                <div className="navbar-divider" />

                <div
                    className="navbar-user-menu"
                    ref={menuRef}
                >
                    <button
                        type="button"
                        className="navbar-user"
                        onClick={() =>
                            setMenuOpen(
                                (current) => !current
                            )
                        }
                        aria-expanded={menuOpen}
                    >
                        <div className="navbar-avatar">
                            {initials}
                        </div>

                        <div className="navbar-user-info">
                            <strong>
                                {user?.fullName || "User"}
                            </strong>

                            <span>
                                {roleLabel}
                            </span>
                        </div>

                        <ChevronDown
                            size={16}
                            className={
                                menuOpen
                                    ? "navbar-chevron open"
                                    : "navbar-chevron"
                            }
                        />
                    </button>

                    {menuOpen && (
                        <div className="navbar-dropdown">

                            <div className="navbar-dropdown-header">
                                <div className="navbar-avatar">
                                    {initials}
                                </div>

                                <div>
                                    <strong>
                                        {user?.fullName}
                                    </strong>

                                    <span>
                                        {user?.email}
                                    </span>
                                </div>
                            </div>

                            <div className="navbar-dropdown-divider" />

                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate("/profile");
                                }}
                            >
                                <User size={17} />
                                My Profile
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    navigate(
                                        "/profile/edit"
                                    );
                                }}
                            >
                                <UserPen size={17} />
                                Edit Profile
                            </button>

                            <div className="navbar-dropdown-divider" />

                            <button
                                type="button"
                                className="navbar-dropdown-logout"
                                onClick={
                                    handleLogout
                                }
                            >
                                <LogOut size={17} />
                                Sign Out
                            </button>

                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}