// src/routes/attachment.routes.ts

import { Router } from "express";

import {
    uploadTicketAttachments,
    uploadCommentAttachments,
    getTicketFiles,
    getCommentFiles,
    getOneAttachment,
    removeAttachment,
} from "../controllers/attachment.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

import {
    requireAnyPermission,
    requirePermission,
} from "../middleware/permission.middleware.js";

import {
    ticketUpload,
} from "../middleware/upload.middleware.js";

const router = Router();

/* =========================================================
   ALL ATTACHMENT ROUTES REQUIRE AUTHENTICATION
   ========================================================= */

router.use(authenticate);

/* =========================================================
   TICKET ATTACHMENTS
   ========================================================= */

router.post(
    "/tickets/:id",
    requireAnyPermission([
        "TICKET_CREATE",
        "TICKET_COMMENT",
        "TICKET_UPDATE",
    ]),
    ticketUpload.array(
        "files",
        5
    ),
    uploadTicketAttachments
);

router.get(
    "/tickets/:id",
    requireAnyPermission([
        "TICKET_VIEW_OWN",
        "TICKET_VIEW_ALL",
    ]),
    getTicketFiles
);

/* =========================================================
   COMMENT ATTACHMENTS
   ========================================================= */

router.post(
    "/tickets/:id/comments/:commentId",
    requireAnyPermission([
        "TICKET_COMMENT",
        "TICKET_INTERNAL_NOTE",
    ]),
    ticketUpload.array(
        "files",
        5
    ),
    uploadCommentAttachments
);

router.get(
    "/comments/:commentId",
    requireAnyPermission([
        "TICKET_VIEW_OWN",
        "TICKET_VIEW_ALL",
    ]),
    getCommentFiles
);

/* =========================================================
   SINGLE ATTACHMENT
   ========================================================= */

router.get(
    "/:attachmentId",
    requireAnyPermission([
        "TICKET_VIEW_OWN",
        "TICKET_VIEW_ALL",
    ]),
    getOneAttachment
);

/* =========================================================
   DELETE ATTACHMENT
   ========================================================= */

router.delete(
    "/:attachmentId",
    requirePermission(
        "TICKET_UPDATE"
    ),
    removeAttachment
);

export default router;