
import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import TicketActivity from "../models/TicketActivity.js";

export const getTicketActivities = async (req, res) => {
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

    const activities = await TicketActivity.find({
      ticketId: id,
    })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
