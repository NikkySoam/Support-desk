
import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: 5000,
    },

    type: {
      type: String,
      enum: ["public_reply", "internal_note"],
      required: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });

const TicketMessage = mongoose.model(
  "TicketMessage",
  ticketMessageSchema
);

export default TicketMessage;
