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

import catLogo from "../assets/cat-logo.png";

import useAuth from "../hooks/useAuth";

import type {
    UserRole,
} from "../context/AuthContext";

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
    const { user } = useAuth();

    const role = user?.role;

    const canSeeItem = (
        item: SidebarItem
    ) => {
        if (!item.roles) {
            return true;
        }

        if (!role) {
            return false;
        }

        return item.roles.includes(role);
    };

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

                <div className="sidebar-brand-text">
                    <h2>WASL</h2>
                    <span>
                        IT Management
                    </span>
                </div>
            </div>

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
                            visibleItems.length === 0
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
                                            >
                                                <Icon
                                                    size={
                                                        19
                                                    }
                                                />

                                                <span>
                                                    {
                                                        item.label
                                                    }
                                                </span>
                                            </NavLink>
                                        );
                                    }
                                )}
                            </div>
                        );
                    }
                )}

            </nav>

            <div className="sidebar-bottom">

                <NavLink
                    to="/tickets/new"
                    className="sidebar-bottom-link"
                >
                    <LifeBuoy size={18} />

                    <span>
                        Get Support
                    </span>
                </NavLink>

                <div className="sidebar-system-status">
                    <span className="status-dot" />

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