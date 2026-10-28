
import Ticket from "../models/Ticket.js";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const overdueCutoff = new Date(
      now.getTime() - 24 * 60 * 60 * 1000
    );

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      urgentTickets,
      overdueTickets,
    ] = await Promise.all([
      // Total tickets
      Ticket.countDocuments(),

      // Tickets with Open status
      Ticket.countDocuments({
        status: "Open",
      }),

      // Tickets currently in progress
      Ticket.countDocuments({
        status: "In Progress",
      }),

      // Resolved tickets
      Ticket.countDocuments({
        status: "Resolved",
      }),

      // All urgent tickets, regardless of status
      Ticket.countDocuments({
        priority: "Urgent",
      }),

      // Unresolved tickets created more than 24 hours ago
      Ticket.countDocuments({
        status: { $ne: "Resolved" },
        createdAt: { $lt: overdueCutoff },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        urgentTickets,
        overdueTickets,
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics",
    });
  }
};
