
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    customerName: {
      type: String,
      trim: true,
      default: "",
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Waiting on Customer",
        "Resolved",
      ],
      default: "Open",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    assignee: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Require at least a customer name or email.
ticketSchema.pre("validate", function () {
  if (!this.customerName?.trim() && !this.customerEmail?.trim()) {
    this.invalidate(
      "customerName",
      "Provide either a customer name or email"
    );
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
