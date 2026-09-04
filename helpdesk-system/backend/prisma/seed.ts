import prisma from "../src/config/prisma.js";

/* =========================================================
   DEFAULT PERMISSIONS
   ========================================================= */

const permissions = [
    /* USER MANAGEMENT */
    {
        code: "USER_VIEW",
        name: "View Users",
        description:
            "View users and employee profiles",
    },
    {
        code: "USER_CREATE",
        name: "Create Users",
        description:
            "Create employee, technician and admin accounts",
    },
    {
        code: "USER_UPDATE",
        name: "Update Users",
        description:
            "Update user profile and organizational data",
    },
    {
        code: "USER_ACTIVATE",
        name: "Activate Users",
        description:
            "Activate user accounts",
    },
    {
        code: "USER_DEACTIVATE",
        name: "Deactivate Users",
        description:
            "Deactivate user accounts",
    },
    {
        code: "USER_ROLE_MANAGE",
        name: "Manage User Roles",
        description:
            "Assign and remove roles from users",
    },

    /* ORGANIZATION */
    {
        code: "ORGANIZATION_VIEW",
        name: "View Organization",
        description:
            "View organization information",
    },
    {
        code: "ORGANIZATION_MANAGE",
        name: "Manage Organization",
        description:
            "Create and update organization information",
    },

    /* BRANCHES */
    {
        code: "BRANCH_VIEW",
        name: "View Branches",
        description:
            "View company branches",
    },
    {
        code: "BRANCH_CREATE",
        name: "Create Branches",
        description:
            "Create company branches",
    },
    {
        code: "BRANCH_UPDATE",
        name: "Update Branches",
        description:
            "Update company branches",
    },

    /* LOCATIONS */
    {
        code: "LOCATION_VIEW",
        name: "View Locations",
        description:
            "View company locations",
    },
    {
        code: "LOCATION_CREATE",
        name: "Create Locations",
        description:
            "Create company locations",
    },
    {
        code: "LOCATION_UPDATE",
        name: "Update Locations",
        description:
            "Update company locations",
    },

    /* DEPARTMENTS */
    {
        code: "DEPARTMENT_VIEW",
        name: "View Departments",
        description:
            "View departments",
    },
    {
        code: "DEPARTMENT_CREATE",
        name: "Create Departments",
        description:
            "Create departments",
    },
    {
        code: "DEPARTMENT_UPDATE",
        name: "Update Departments",
        description:
            "Update departments",
    },

    /* TEAMS */
    {
        code: "TEAM_VIEW",
        name: "View Teams",
        description:
            "View support and operational teams",
    },
    {
        code: "TEAM_CREATE",
        name: "Create Teams",
        description:
            "Create teams",
    },
    {
        code: "TEAM_UPDATE",
        name: "Update Teams",
        description:
            "Update teams",
    },

    /* TICKETS */
    {
        code: "TICKET_VIEW_OWN",
        name: "View Own Tickets",
        description:
            "View tickets created by the user",
    },
    {
        code: "TICKET_VIEW_ALL",
        name: "View All Tickets",
        description:
            "View all support tickets",
    },
    {
        code: "TICKET_CREATE",
        name: "Create Tickets",
        description:
            "Create support tickets",
    },
    {
        code: "TICKET_UPDATE",
        name: "Update Tickets",
        description:
            "Update ticket information",
    },
    {
        code: "TICKET_ASSIGN",
        name: "Assign Tickets",
        description:
            "Assign tickets to technicians",
    },
    {
        code: "TICKET_REASSIGN",
        name: "Reassign Tickets",
        description:
            "Reassign tickets between technicians or teams",
    },
    {
        code: "TICKET_RESOLVE",
        name: "Resolve Tickets",
        description:
            "Resolve support tickets",
    },
    {
        code: "TICKET_CLOSE",
        name: "Close Tickets",
        description:
            "Close resolved tickets",
    },
    {
        code: "TICKET_REOPEN",
        name: "Reopen Tickets",
        description:
            "Reopen previously resolved or closed tickets",
    },
    {
        code: "TICKET_COMMENT",
        name: "Comment on Tickets",
        description:
            "Add public comments to tickets",
    },
    {
        code: "TICKET_INTERNAL_NOTE",
        name: "Add Internal Ticket Notes",
        description:
            "Add internal IT notes to tickets",
    },
    {
        code: "TICKET_ESCALATE",
        name: "Escalate Tickets",
        description:
            "Escalate tickets to higher support levels",
    },

    /* ASSETS */
    {
        code: "ASSET_VIEW",
        name: "View Assets",
        description:
            "View company IT assets",
    },
    {
        code: "ASSET_CREATE",
        name: "Create Assets",
        description:
            "Register new IT assets",
    },
    {
        code: "ASSET_UPDATE",
        name: "Update Assets",
        description:
            "Update asset information",
    },
    {
        code: "ASSET_ASSIGN",
        name: "Assign Assets",
        description:
            "Assign assets to employees",
    },
    {
        code: "ASSET_UNASSIGN",
        name: "Unassign Assets",
        description:
            "Remove asset assignments from employees",
    },
    {
        code: "ASSET_TRANSFER",
        name: "Transfer Assets",
        description:
            "Transfer assets between branches, departments or users",
    },
    {
        code: "ASSET_MAINTENANCE",
        name: "Manage Asset Maintenance",
        description:
            "Manage asset maintenance records",
    },
    {
        code: "ASSET_RETIRE",
        name: "Retire Assets",
        description:
            "Retire assets from active service",
    },

    /* CATEGORIES */
    {
        code: "CATEGORY_VIEW",
        name: "View Categories",
        description:
            "View ticket categories",
    },
    {
        code: "CATEGORY_MANAGE",
        name: "Manage Categories",
        description:
            "Create and update ticket categories",
    },

    /* REPORTS */
    {
        code: "REPORT_VIEW",
        name: "View Reports",
        description:
            "View operational reports and dashboards",
    },
    {
        code: "REPORT_EXPORT",
        name: "Export Reports",
        description:
            "Export operational reports",
    },

    /* SLA */
    {
        code: "SLA_VIEW",
        name: "View SLA",
        description:
            "View SLA policies and performance",
    },
    {
        code: "SLA_MANAGE",
        name: "Manage SLA",
        description:
            "Create and update SLA policies",
    },

    /* RBAC */
    {
        code: "ROLE_VIEW",
        name: "View Roles",
        description:
            "View system roles and permissions",
    },
    {
        code: "ROLE_CREATE",
        name: "Create Roles",
        description:
            "Create system roles",
    },
    {
        code: "ROLE_UPDATE",
        name: "Update Roles",
        description:
            "Update system roles",
    },
    {
        code: "ROLE_PERMISSION_MANAGE",
        name: "Manage Role Permissions",
        description:
            "Assign and remove permissions from system roles",
    },

    /* AUDIT */
    {
        code: "AUDIT_VIEW",
        name: "View Audit Log",
        description:
            "View system audit logs",
    },

    /* SYSTEM SETTINGS */
    {
        code: "SYSTEM_SETTINGS_VIEW",
        name: "View System Settings",
        description:
            "View system configuration",
    },
    {
        code: "SYSTEM_SETTINGS_MANAGE",
        name: "Manage System Settings",
        description:
            "Update system configuration",
    },
];

/* =========================================================
   DEFAULT SYSTEM ROLES
   ========================================================= */

const defaultRoles = [
    {
        code: "EMPLOYEE_SELF_SERVICE",
        name: "Employee Self Service",
        description:
            "Default employee permissions",
        permissions: [
            "TICKET_VIEW_OWN",
            "TICKET_CREATE",
            "TICKET_COMMENT",
            "ASSET_VIEW",
        ],
    },

    {
        code: "SERVICE_DESK_AGENT",
        name: "Service Desk Agent",
        description:
            "Handles daily IT support tickets",
        permissions: [
            "TICKET_VIEW_ALL",
            "TICKET_UPDATE",
            "TICKET_ASSIGN",
            "TICKET_RESOLVE",
            "TICKET_COMMENT",
            "TICKET_INTERNAL_NOTE",
            "ASSET_VIEW",
        ],
    },

    {
        code: "SERVICE_DESK_MANAGER",
        name: "Service Desk Manager",
        description:
            "Manages service desk operations",
        permissions: [
            "TICKET_VIEW_ALL",
            "TICKET_UPDATE",
            "TICKET_ASSIGN",
            "TICKET_REASSIGN",
            "TICKET_RESOLVE",
            "TICKET_CLOSE",
            "TICKET_REOPEN",
            "TICKET_COMMENT",
            "TICKET_INTERNAL_NOTE",
            "TICKET_ESCALATE",
            "REPORT_VIEW",
            "SLA_VIEW",
        ],
    },

    {
        code: "ASSET_MANAGER",
        name: "Asset Manager",
        description:
            "Manages company IT assets",
        permissions: [
            "ASSET_VIEW",
            "ASSET_CREATE",
            "ASSET_UPDATE",
            "ASSET_ASSIGN",
            "ASSET_UNASSIGN",
            "ASSET_TRANSFER",
            "ASSET_MAINTENANCE",
            "ASSET_RETIRE",
        ],
    },

    {
        code: "USER_ADMIN",
        name: "User Administrator",
        description:
            "Manages employee accounts",
        permissions: [
            "USER_VIEW",
            "USER_CREATE",
            "USER_UPDATE",
            "USER_ACTIVATE",
            "USER_DEACTIVATE",
        ],
    },

    {
        code: "REPORT_VIEWER",
        name: "Report Viewer",
        description:
            "Views and exports reports",
        permissions: [
            "REPORT_VIEW",
            "REPORT_EXPORT",
        ],
    },

    {
        code: "ORGANIZATION_ADMIN",
        name: "Organization Administrator",
        description:
            "Manages organization structure",
        permissions: [
            "ORGANIZATION_VIEW",
            "ORGANIZATION_MANAGE",
            "BRANCH_VIEW",
            "BRANCH_CREATE",
            "BRANCH_UPDATE",
            "LOCATION_VIEW",
            "LOCATION_CREATE",
            "LOCATION_UPDATE",
            "DEPARTMENT_VIEW",
            "DEPARTMENT_CREATE",
            "DEPARTMENT_UPDATE",
            "TEAM_VIEW",
            "TEAM_CREATE",
            "TEAM_UPDATE",
        ],
    },

    {
        code: "ROLE_ADMIN",
        name: "Role Administrator",
        description:
            "Manages roles and permissions",
        permissions: [
            "ROLE_VIEW",
            "ROLE_CREATE",
            "ROLE_UPDATE",
            "ROLE_PERMISSION_MANAGE",
            "USER_ROLE_MANAGE",
        ],
    },

    {
        code: "SYSTEM_ADMIN",
        name: "System Administrator",
        description:
            "Full WASL administration access",
        permissions: permissions.map(
            (permission) =>
                permission.code
        ),
    },
];

/* =========================================================
   SEED PERMISSIONS
   ========================================================= */

const seedPermissions = async () => {
    console.log(
        "Seeding permissions..."
    );

    for (
        const permission of
        permissions
    ) {
        await prisma.permission.upsert({
            where: {
                code: permission.code,
            },

            update: {
                name: permission.name,
                description:
                    permission.description,
            },

            create: {
                code: permission.code,
                name: permission.name,
                description:
                    permission.description,
            },
        });
    }

    console.log(
        `${permissions.length} permissions ready.`
    );
};

/* =========================================================
   SEED GLOBAL ROLES
   ========================================================= */

const seedRoles = async () => {
    console.log(
        "Seeding default roles..."
    );

    for (
        const roleData of
        defaultRoles
    ) {
        let role =
            await prisma.systemRole.findFirst({
                where: {
                    code: roleData.code,
                    organizationId: null,
                },
            });

        if (!role) {
            role =
                await prisma.systemRole.create({
                    data: {
                        code:
                            roleData.code,
                        name:
                            roleData.name,
                        description:
                            roleData.description,
                    },
                });
        } else {
            role =
                await prisma.systemRole.update({
                    where: {
                        id: role.id,
                    },

                    data: {
                        name:
                            roleData.name,
                        description:
                            roleData.description,
                    },
                });
        }

        for (
            const permissionCode of
            roleData.permissions
        ) {
            const permission =
                await prisma.permission.findUnique({
                    where: {
                        code:
                            permissionCode,
                    },
                });

            if (!permission) {
                throw new Error(
                    `Permission ${permissionCode} was not found`
                );
            }

            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId:
                            permission.id,
                    },
                },

                update: {},

                create: {
                    roleId:
                        role.id,
                    permissionId:
                        permission.id,
                },
            });
        }
    }

    console.log(
        `${defaultRoles.length} roles ready.`
    );
};

/* =========================================================
   MAIN
   ========================================================= */

const main = async () => {
    console.log(
        "Starting WASL seed..."
    );

    await seedPermissions();
    await seedRoles();

    console.log(
        "WASL seed completed successfully."
    );
};

main()
    .catch((error) => {
        console.error(
            "Seed failed:"
        );

        console.error(error);

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });