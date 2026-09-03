import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    TicketCheck,
    Laptop,
    Users,
    Building2,
    Tags,
    BarChart3,
    UserCircle,
    UserPen,
    LifeBuoy,
} from "lucide-react";

import catLogo from "../assets/cat-logo.png";

export default function Sidebar() {
    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const isAdmin = user.role === "ADMIN";

    const isITStaff =
        user.role === "ADMIN" ||
        user.role === "TECHNICIAN";

    const linkClass = ({
        isActive,
    }: {
        isActive: boolean;
    }) =>
        isActive
            ? "sidebar-link active"
            : "sidebar-link";

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <img
                        src={catLogo}
                        alt="WASL"
                    />
                </div>

                <div>
                    <h2>WASL</h2>
                    <span>IT Management</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={linkClass}
                >
                    <LayoutDashboard size={19} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/tickets"
                    className={linkClass}
                >
                    <TicketCheck size={19} />
                    <span>Tickets</span>
                </NavLink>

                {isITStaff && (
                    <NavLink
                        to="/assets"
                        className={linkClass}
                    >
                        <Laptop size={19} />
                        <span>Assets</span>
                    </NavLink>
                )}

                {isITStaff && (
                    <NavLink
                        to="/reports"
                        className={linkClass}
                    >
                        <BarChart3 size={19} />
                        <span>Reports</span>
                    </NavLink>
                )}

                {isAdmin && (
                    <>
                        <div className="sidebar-section-label">
                            Management
                        </div>

                        <NavLink
                            to="/users"
                            className={linkClass}
                        >
                            <Users size={19} />
                            <span>Users</span>
                        </NavLink>

                        <NavLink
                            to="/departments"
                            className={linkClass}
                        >
                            <Building2 size={19} />
                            <span>Departments</span>
                        </NavLink>

                        <NavLink
                            to="/categories"
                            className={linkClass}
                        >
                            <Tags size={19} />
                            <span>Categories</span>
                        </NavLink>
                    </>
                )}

                <div className="sidebar-section-label">
                    Account
                </div>

                <NavLink
                    to="/profile"
                    className={linkClass}
                >
                    <UserCircle size={19} />
                    <span>Profile</span>
                </NavLink>

                <NavLink
                    to="/profile/edit"
                    className={linkClass}
                >
                    <UserPen size={19} />
                    <span>Edit Profile</span>
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <NavLink
                    to="/tickets/new"
                    className="sidebar-bottom-link"
                >
                    <LifeBuoy size={18} />
                    <span>Get Support</span>
                </NavLink>

                <div className="sidebar-system-status">
                    <span className="status-dot" />

                    <div>
                        <strong>System Online</strong>
                        <small>
                            All services operational
                        </small>
                    </div>
                </div>
            </div>
        </aside>
    );
}