import { Router } from "express";

import {
    register,
    login,
} from "../controllers/auth.controller.js";

import {
    authenticate,
    type AuthRequest,
} from "../middleware/auth.middleware.js";

import {
    authorize,
} from "../middleware/role.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, (req: AuthRequest, res) => {
    return res.status(200).json({
        success: true,
        user: req.user,
    });
});

router.get(
    "/admin-test",
    authenticate,
    authorize("ADMIN"),
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Welcome Admin",
        });
    }
);

export default router;