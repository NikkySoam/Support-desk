
import TicketActivity from "../models/TicketActivity.js";

const logActivity = async ({
  ticketId,
  action,
  description,
  actor = "System",
}) => {
  return TicketActivity.create({
    ticketId,
    action,
    description,
    actor,
  });
};

export default logActivity;
