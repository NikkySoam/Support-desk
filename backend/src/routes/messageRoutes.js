import express from "express";

import {
  getTicketMessages,
  addTicketMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/:id/messages", getTicketMessages);
router.post("/:id/messages", addTicketMessage);

export default router;