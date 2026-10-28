import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";

const STATUSES = [
  "Open",
  "In Progress",
  "Waiting on Customer",
  "Resolved",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);

  const [assignee, setAssignee] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("public_reply");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadTicketData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ticketResponse, messagesResponse, activitiesResponse] =
        await Promise.all([
          api.get(`/tickets/${id}`),
          api.get(`/tickets/${id}/messages`),
          api.get(`/tickets/${id}/activities`),
        ]);

      const ticketData =
        ticketResponse.data.data ?? ticketResponse.data;

      const messageData =
        messagesResponse.data.data ?? messagesResponse.data;

      const activityData =
        activitiesResponse.data.data ?? activitiesResponse.data;

      if (!ticketData?._id) {
        throw new Error("Ticket details were not returned by the server.");
      }

      setTicket(ticketData);
      setAssignee(ticketData.assignee || "");
      setMessages(Array.isArray(messageData) ? messageData : []);
      setActivities(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

//   useEffect(() => {
//     loadTicketData();
//   }, [loadTicketData]);

    useEffect(() => {
    const timer = setTimeout(() => {
        loadTicketData();
    }, 0);

    return () => {
        clearTimeout(timer);
    };
    }, [loadTicketData]);

  const updateTicket = async (changes) => {
    setSaving(true);
    setError("");

    try {
      const response = await api.patch(`/tickets/${id}`, changes);
      const updatedTicket =
        response.data.data ?? response.data;

      setTicket((current) => ({
        ...current,
        ...updatedTicket,
        ...changes,
      }));

      await loadTicketData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update the ticket."
      );
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await api.post(`/tickets/${id}/messages`, {
        content: message.trim(),
        type: messageType,
        author: "Support Agent",
      });

      setMessage("");
      await loadTicketData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to send the message."
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading ticket...</div>;
  }

  if (error && !ticket) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/tickets")}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return <p className="p-8">Ticket not found.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/tickets")}
          className="mb-5 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to tickets
        </button>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-red-50 p-3 text-red-700"
          >
            {error}
          </div>
        )}

        {/* Ticket header */}
        <section className="rounded-xl border bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Ticket #{ticket._id}
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                {ticket.subject}
              </h1>

              <p className="mt-2 text-gray-600">
                Customer: {ticket.customerName || "—"}
                {ticket.customerEmail
                  ? ` (${ticket.customerEmail})`
                  : ""}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Created:{" "}
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
              {ticket.status}
            </span>
          </div>

          <div className="mt-6 border-t pt-5">
            <h2 className="font-semibold text-gray-900">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-700">
              {ticket.description}
            </p>
          </div>

          {/* Ticket editing */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="ticket-status"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </label>

              <select
                id="ticket-status"
                value={ticket.status}
                disabled={saving}
                onChange={(event) =>
                  updateTicket({ status: event.target.value })
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-priority"
                className="mb-2 block text-sm font-medium"
              >
                Priority
              </label>

              <select
                id="ticket-priority"
                value={ticket.priority}
                disabled={saving}
                onChange={(event) =>
                  updateTicket({ priority: event.target.value })
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                updateTicket({ assignee: assignee.trim() });
              }}
            >
              <label
                htmlFor="ticket-assignee"
                className="mb-2 block text-sm font-medium"
              >
                Assignee
              </label>

              <div className="flex gap-2">
                <input
                  id="ticket-assignee"
                  value={assignee}
                  onChange={(event) => setAssignee(event.target.value)}
                  placeholder="Agent name"
                  disabled={saving}
                  className="min-w-0 flex-1 rounded-lg border px-3 py-2"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Conversation */}
        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Conversation
          </h2>

          <div className="mt-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">
                No replies or notes yet.
              </p>
            ) : (
              messages.map((item) => {
                const isInternal = item.type === "internal_note";

                return (
                  <article
                    key={item._id}
                    className={`rounded-lg border p-4 ${
                      isInternal
                        ? "border-amber-300 bg-amber-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="font-semibold text-gray-900">
                        {item.author || "Unknown author"}
                      </p>

                      <span className="text-xs text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide">
                      {isInternal ? "Internal note" : "Public reply"}
                    </p>

                    <p className="mt-3 whitespace-pre-wrap text-gray-700">
                      {item.content}
                    </p>
                  </article>
                );
              })
            )}
          </div>

          <form onSubmit={sendMessage} className="mt-6 border-t pt-5">
            <label
              htmlFor="message-type"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Message type
            </label>

            <select
              id="message-type"
              value={messageType}
              onChange={(event) => setMessageType(event.target.value)}
              className="mb-4 rounded-lg border px-3 py-2"
            >
              <option value="public_reply">Public reply</option>
              <option value="internal_note">Internal note</option>
            </select>

            <label
              htmlFor="ticket-message"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Your message
            </label>

            <textarea
              id="ticket-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              maxLength={5000}
              required
              placeholder="Write a reply or internal note..."
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={sending}
              className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending
                ? "Sending..."
                : messageType === "internal_note"
                  ? "Add Internal Note"
                  : "Send Reply"}
            </button>
          </form>
        </section>

        {/* Activity history */}
        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Activity History
          </h2>

          {activities.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No activity recorded yet.
            </p>
          ) : (
            <ol className="mt-4 space-y-4">
              {activities.map((activity) => (
                <li
                  key={activity._id}
                  className="border-l-2 border-blue-200 pl-4"
                >
                  <p className="font-medium text-gray-800">
                    {activity.description || activity.action}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {activity.actor || "System"}
                    {" · "}
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleString()
                      : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}