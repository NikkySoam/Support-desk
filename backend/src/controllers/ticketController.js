
import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import logActivity from "../services/activityService.js";
import TicketActivity from "../models/TicketActivity.js";

const VALID_STATUSES = [
  "Open",
  "In Progress",
  "Waiting on Customer",
  "Resolved",
];

const VALID_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const EDITABLE_FIELDS = [
  "subject",
  "customerName",
  "customerEmail",
  "description",
  "status",
  "priority",
  "assignee",
];

// POST /api/tickets
export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      customerName,
      customerEmail,
      description,
      status,
      priority,
      assignee,
    } = req.body;

    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    if (!customerName?.trim() && !customerEmail?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name or email is required",
      });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    if (
      priority !== undefined &&
      !VALID_PRIORITIES.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket priority",
      });
    }

    const ticket = await Ticket.create({
    subject,
    customerName,
    customerEmail,
    description,
    status,
    priority,
    assignee,
    });

    await logActivity({
    ticketId: ticket._id,
    action: "TICKET_CREATED",
    description: `Ticket "${ticket.subject}" was created`,
    actor: "Nikky",
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// GET /api/tickets
export const getTickets = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      assignee,
      sortBy = "updatedAt",
      order = "desc",
    } = req.query;

    const filter = {};

    // Search by subject, customer name, or email.
    if (search?.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { subject: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
      ];
    }

    // Validate filters.
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter",
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority filter",
      });
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (assignee) {
      filter.assignee = assignee;
    }

    // Allow only supported sorting fields.
    const sortFields = {
      updatedAt: "updatedAt",
      priority: "priority",
    };

    if (!sortFields[sortBy]) {
      return res.status(400).json({
        success: false,
        message: "Invalid sorting field",
      });
    }

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({
        success: false,
        message: "Order must be asc or desc",
      });
    }

    const sortDirection = order === "asc" ? 1 : -1;

    const sort = {};

    if (sortBy === "priority") {
      // Explicit ordering: Urgent > High > Medium > Low.
      const priorityRank = {
        Urgent: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      };

      const tickets = await Ticket.find(filter).lean();

      tickets.sort((a, b) => {
        const difference =
          priorityRank[a.priority] - priorityRank[b.priority];

        if (difference !== 0) {
          return difference * sortDirection;
        }

        return (
          (new Date(b.updatedAt) - new Date(a.updatedAt)) *
          sortDirection
        );
      });

      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
      });
    }

    sort[sortFields[sortBy]] = sortDirection;

    const tickets = await Ticket.find(filter)
      .sort(sort)
      .lean();

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// GET /api/tickets/:id
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Get ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// PATCH /api/tickets/:id
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const updates = req.body;

    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates) ||
      Object.keys(updates).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const invalidFields = Object.keys(updates).filter(
      (field) => !EDITABLE_FIELDS.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Fields cannot be updated: ${invalidFields.join(", ")}`,
      });
    }

    if (
      updates.status !== undefined &&
      !VALID_STATUSES.includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    if (
      updates.priority !== undefined &&
      !VALID_PRIORITIES.includes(updates.priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket priority",
      });
    }

    const currentTicket = await Ticket.findById(id);

    if (!currentTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

   
    const activityEntries = [];

    const fieldsToTrack = [
    {
        field: "status",
        action: "STATUS_CHANGED",
        label: "Status",
    },
    {
        field: "priority",
        action: "PRIORITY_CHANGED",
        label: "Priority",
    },
    {
        field: "assignee",
        action: "ASSIGNEE_CHANGED",
        label: "Assignee",
    },
    ];

    // Capture actual changes before updating the document.
    for (const { field, action, label } of fieldsToTrack) {
    if (
        Object.prototype.hasOwnProperty.call(updates, field) &&
        updates[field] !== currentTicket[field]
    ) {
        activityEntries.push({
        ticketId: currentTicket._id,
        action,
        description: `${label} changed from ${
            currentTicket[field] || "Unassigned"
        } to ${updates[field] || "Unassigned"}`,
        actor: "Nikky",
        });
    }
    }

    // Apply all permitted updates.
    for (const [field, value] of Object.entries(updates)) {
    currentTicket.set(field, value);
    }

    const updatedTicket = await currentTicket.save();

    // Save activity records only for actual changes.
    if (activityEntries.length > 0) {
    await TicketActivity.insertMany(activityEntries);
    }


    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
