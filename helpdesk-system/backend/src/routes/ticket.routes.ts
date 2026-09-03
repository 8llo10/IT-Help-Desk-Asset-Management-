import { Router } from "express";

import {
  create,
  getAll,
  assign,
  updateStatus,
} from "../controllers/ticket.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

import {
  authorize,
} from "../middleware/role.middleware.js";

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

export default router;