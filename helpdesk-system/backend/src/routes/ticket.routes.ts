// src/routes/ticket.routes.ts

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
    requirePermission,
    requireAnyPermission,
} from "../middleware/permission.middleware.js";

import {
    create as createComment,
    getAll as getComments,
} from "../controllers/comment.controller.js";

const router = Router();

/* =========================================================
   ALL TICKET ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   CREATE TICKET
   ========================================================= */

router.post(
    "/",
    requirePermission("TICKET_CREATE"),
    create
);

/* =========================================================
   VIEW TICKETS
   ========================================================= */

router.get(
    "/",
    requireAnyPermission([
        "TICKET_VIEW_OWN",
        "TICKET_VIEW_ALL",
    ]),
    getAll
);

/* =========================================================
   ASSIGN TICKET
   ========================================================= */

router.patch(
    "/:id/assign",
    requirePermission("TICKET_ASSIGN"),
    assign
);

/* =========================================================
   UPDATE TICKET STATUS
   ========================================================= */

router.patch(
    "/:id/status",
    requireAnyPermission([
        "TICKET_UPDATE",
        "TICKET_RESOLVE",
        "TICKET_CLOSE",
        "TICKET_REOPEN",
    ]),
    updateStatus
);

/* =========================================================
   TICKET CONVERSATION / COMMENTS
   ========================================================= */

router.post(
    "/:id/comments",
    requireAnyPermission([
        "TICKET_COMMENT",
        "TICKET_INTERNAL_NOTE",
    ]),
    createComment
);

router.get(
    "/:id/comments",
    requireAnyPermission([
        "TICKET_VIEW_OWN",
        "TICKET_VIEW_ALL",
    ]),
    getComments
);

/* =========================================================
   TICKET HISTORY
   ========================================================= */

router.get(
    "/:id/history",
    requireAnyPermission([
        "TICKET_VIEW_OWN",
        "TICKET_VIEW_ALL",
    ]),
    history
);

export default router;