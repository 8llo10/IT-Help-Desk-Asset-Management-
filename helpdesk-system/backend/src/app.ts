import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import assetRoutes from "./routes/asset.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { notFound, errorHandler, } from "./middleware/error.middleware.js";
import organizationRoutes from "./routes/organization.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import locationRoutes from "./routes/location.routes.js";
import teamRoutes from "./routes/team.routes.js";
import permissionRoutes from "./routes/permission.routes.js";
import roleRoutes from "./routes/role.routes.js";
import attachmentRoutes from "./routes/attachment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
    "/uploads",
    express.static("uploads")
);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "IT Help Desk API is running",
    });
});

app.get("/api/health", async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
        success: true,
        database: "connected",
        message: "IT Help Desk API is healthy",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tickets", ticketRoutes);
app.use(
    "/api/attachments",
    attachmentRoutes
);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/organizations", organizationRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/roles", roleRoutes);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(notFound);
app.use(errorHandler);

export default app;