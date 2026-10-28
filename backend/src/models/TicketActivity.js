
import mongoose from "mongoose";

const ticketActivitySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "TICKET_CREATED",
        "STATUS_CHANGED",
        "PRIORITY_CHANGED",
        "ASSIGNEE_CHANGED",
        "PUBLIC_REPLY_ADDED",
        "INTERNAL_NOTE_ADDED"
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    actor: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ticketActivitySchema.index({ ticketId: 1, createdAt: 1 });

const TicketActivity = mongoose.model(
  "TicketActivity",
  ticketActivitySchema
);

export default TicketActivity;
