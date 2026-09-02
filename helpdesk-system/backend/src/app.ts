import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";

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

export default app;