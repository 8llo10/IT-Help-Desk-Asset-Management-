import { Router } from "express";

import {
    create,
    getAll,
    assign,
    updateStatus,
    history,
} from "../controllers/ticket.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    authorize,
} from "../middleware/role.middleware.js";

import {
    create as createComment,
    getAll as getComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.post(
    "/",
    authenticate,
    create
);

router.get(
    "/",
    authenticate,
    getAll
);

router.patch(
    "/:id/assign",
    authenticate,
    authorize("ADMIN"),
    assign
);

router.patch(
    "/:id/status",
    authenticate,
    updateStatus
);

router.post(
    "/:id/comments",
    authenticate,
    createComment
);

router.get(
    "/:id/comments",
    authenticate,
    getComments
);

// Ticket history
router.get(
    "/:id/history",
    authenticate,
    history
);

export default router;