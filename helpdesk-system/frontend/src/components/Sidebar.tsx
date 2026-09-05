import {
    NavLink,
} from "react-router-dom";

import type {
    LucideIcon,
} from "lucide-react";

import {
    BarChart3,
    Bell,
    Building2,
    Building,
    GitBranch,
    LayoutDashboard,
    Laptop,
    LifeBuoy,
    MapPin,
    ShieldCheck,
    Tags,
    TicketCheck,
    Users,
    UsersRound,
} from "lucide-react";

import waslLogo from "../assets/wasl-logo.png";
import waslCharacters from "../assets/wasl-characters.png";

import useAuth from "../hooks/useAuth";

import type {
    UserRole,
} from "../context/AuthContext";

import "../styles/Sidebar.css";

interface SidebarItem {
    label: string;
    path: string;
    icon: LucideIcon;
    roles?: UserRole[];
}

interface SidebarSection {
    title?: string;
    items: SidebarItem[];
}

const sections: SidebarSection[] = [
    {
        items: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                label: "Tickets",
                path: "/tickets",
                icon: TicketCheck,
            },
            {
                label: "Assets",
                path: "/assets",
                icon: Laptop,
            },
        ],
    },

    {
        title: "Management",

        items: [
            {
                label: "Users",
                path: "/users",
                icon: Users,
                roles: ["ADMIN"],
            },
            {
                label: "Roles & Permissions",
                path: "/roles",
                icon: ShieldCheck,
                roles: ["ADMIN"],
            },
            {
                label: "Departments",
                path: "/departments",
                icon: Building2,
                roles: ["ADMIN"],
            },
            {
                label: "Teams",
                path: "/teams",
                icon: UsersRound,
                roles: ["ADMIN"],
            },
            {
                label: "Categories",
                path: "/categories",
                icon: Tags,
                roles: ["ADMIN"],
            },
        ],
    },

    {
        title: "Organization",

        items: [
            {
                label: "Organization",
                path: "/organizations",
                icon: Building,
                roles: ["ADMIN"],
            },
            {
                label: "Branches",
                path: "/branches",
                icon: GitBranch,
                roles: ["ADMIN"],
            },
            {
                label: "Locations",
                path: "/locations",
                icon: MapPin,
                roles: ["ADMIN"],
            },
        ],
    },

    {
        title: "Insights",

        items: [
            {
                label: "Reports",
                path: "/reports",
                icon: BarChart3,

                roles: [
                    "ADMIN",
                    "TECHNICIAN",
                ],
            },
            {
                label: "Notifications",
                path: "/notifications",
                icon: Bell,
            },
        ],
    },
];

export default function Sidebar() {
    const {
        user,
    } = useAuth();

    const role =
        user?.role;

    /* =========================================================
       ACCESS
       ========================================================= */

    const canSeeItem = (
        item: SidebarItem
    ) => {
        if (
            !item.roles
        ) {
            return true;
        }

        if (
            !role
        ) {
            return false;
        }

        return item.roles.includes(
            role
        );
    };

    const linkClass = ({
        isActive,
    }: {
        isActive: boolean;
    }) =>
        isActive
            ? "sidebar-link active"
            : "sidebar-link";

    /* =========================================================
       UI
       ========================================================= */

    return (
        <aside className="sidebar">

            {/* =====================================================
          BRAND
          ===================================================== */}

            <NavLink
                to="/dashboard"
                className="sidebar-brand"
            >
                <div className="sidebar-logo">

                    <img
                        src={waslLogo}
                        alt="WASL"
                    />

                </div>

                <div className="sidebar-brand-text">

                    <strong>
                        WASL
                    </strong>

                    <span>
                        IT Management
                    </span>

                </div>

            </NavLink>

            {/* =====================================================
          NAVIGATION
          ===================================================== */}

            <nav className="sidebar-nav">

                {sections.map(
                    (
                        section,
                        sectionIndex
                    ) => {
                        const visibleItems =
                            section.items.filter(
                                canSeeItem
                            );

                        if (
                            visibleItems.length ===
                            0
                        ) {
                            return null;
                        }

                        return (
                            <div
                                className="sidebar-section"
                                key={
                                    section.title ??
                                    sectionIndex
                                }
                            >

                                {section.title && (
                                    <div className="sidebar-section-label">
                                        {section.title}
                                    </div>
                                )}

                                <div className="sidebar-section-links">

                                    {visibleItems.map(
                                        (item) => {
                                            const Icon =
                                                item.icon;

                                            return (
                                                <NavLink
                                                    key={
                                                        item.path
                                                    }
                                                    to={
                                                        item.path
                                                    }
                                                    className={
                                                        linkClass
                                                    }
                                                    title={
                                                        item.label
                                                    }
                                                >

                                                    <span className="sidebar-link-icon">
                                                        <Icon
                                                            size={18}
                                                            strokeWidth={1.9}
                                                        />
                                                    </span>

                                                    <span className="sidebar-link-label">
                                                        {item.label}
                                                    </span>

                                                </NavLink>
                                            );
                                        }
                                    )}

                                </div>

                            </div>
                        );
                    }
                )}

            </nav>

            {/* =====================================================
          BOTTOM
          ===================================================== */}

            <div className="sidebar-bottom">

                {/* SUPPORT CARD */}

                <div className="sidebar-support-card">

                    <div className="sidebar-support-copy">

                        <span>
                            NEED HELP?
                        </span>

                        <strong>
                            IT Support
                        </strong>

                        <p>
                            Create a support request
                            and let the IT team help.
                        </p>

                        <NavLink
                            to="/tickets/new"
                            className="sidebar-support-button"
                        >
                            <LifeBuoy
                                size={16}
                            />

                            Get Support
                        </NavLink>

                    </div>

                    <img
                        src={waslCharacters}
                        alt=""
                        aria-hidden="true"
                        className="sidebar-support-mascot"
                    />

                </div>

                {/* SYSTEM STATUS */}

                <div className="sidebar-system-status">

                    <span className="sidebar-status-dot" />

                    <div>

                        <strong>
                            System Online
                        </strong>

                        <small>
                            All services operational
                        </small>

                    </div>

                </div>

            </div>

        </aside>
    );
}