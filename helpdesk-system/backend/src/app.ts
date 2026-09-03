import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import assetRoutes from "./routes/asset.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

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

export default app;