
import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import TicketMessage from "../models/TicketMessage.js";
import logActivity from "../services/activityService.js";

const VALID_MESSAGE_TYPES = [
  "public_reply",
  "internal_note",
];

// GET /api/tickets/:id/messages
export const getTicketMessages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticketExists = await Ticket.exists({ _id: id });

    if (!ticketExists) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const messages = await TicketMessage.find({
      ticketId: id,
    })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get ticket messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /api/tickets/:id/messages
export const addTicketMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, author } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters",
      });
    }

    if (!VALID_MESSAGE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message type",
      });
    }

    if (typeof author !== "string" || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: "Author is required",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const message = await TicketMessage.create({
      ticketId: ticket._id,
      content: content.trim(),
      type,
      author: author.trim(),
    });

    // Record the message in ticket activity history.
    await logActivity({
      ticketId: ticket._id,
      action:
        type === "public_reply"
          ? "PUBLIC_REPLY_ADDED"
          : "INTERNAL_NOTE_ADDED",
      description:
        type === "public_reply"
          ? `Public reply added by ${author.trim()}`
          : `Internal note added by ${author.trim()}`,
      actor: author.trim(),
    });

    // Update the ticket's last-updated timestamp.
    ticket.updatedAt = new Date();
    await ticket.save();

    return res.status(201).json({
      success: true,
      message: "Message added successfully",
      data: message,
    });
  } catch (error) {
    console.error("Add ticket message error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
