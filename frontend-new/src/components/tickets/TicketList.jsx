import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const statuses = [
  "Open",
  "In Progress",
  "Waiting on Customer",
  "Resolved",
];

const priorities = ["Low", "Medium", "High", "Urgent"];

const priorityStyles = {
  Low: "bg-gray-100 text-gray-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const statusStyles = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  "Waiting on Customer": "bg-purple-100 text-purple-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function TicketList() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    assignee: "",
    sortBy: "updatedAt",
  });

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.status) params.status = filters.status;
        if (filters.priority) params.priority = filters.priority;
        if (filters.assignee.trim()) {
          params.assignee = filters.assignee.trim();
        }

        params.sortBy = filters.sortBy;

        const response = await api.get("/tickets", {
          params,
          signal: controller.signal,
        });

        // Supports either { data: [...] } or a direct array response.
        const result = response.data.data ?? response.data;
        setTickets(Array.isArray(result) ? result : []);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;

        setError(
          err.response?.data?.message || "Unable to load tickets."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Support Tickets
            </h1>
            <p className="mt-2 text-gray-600">
              Search, filter, and manage customer support requests.
            </p>
          </div>

          {/* <button
            onClick={() => navigate("/tickets/new")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            + Create Ticket
          </button> */}
        </div>

        {/* Search and filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="search"
            placeholder="Search subject or customer..."
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          />

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter("status", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(event) =>
              updateFilter("priority", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by assignee"
            value={filters.assignee}
            onChange={(event) =>
              updateFilter("assignee", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          />

          <select
            value={filters.sortBy}
            onChange={(event) =>
              updateFilter("sortBy", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="updatedAt">Recently updated</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {/* Ticket list */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <p className="p-8 text-center text-gray-500">
              Loading tickets...
            </p>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() =>
                  setFilters((current) => ({ ...current }))
                }
                className="mt-3 rounded-lg border px-4 py-2"
              >
                Retry
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                No tickets found
              </h2>
              <p className="mt-2 text-gray-500">
                Try changing your filters or create a new ticket.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-sm text-gray-600">
                  <tr>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Assignee</th>
                    <th className="px-5 py-4">Last Updated</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                          {ticket.description}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {ticket.customerName ||
                          ticket.customerEmail ||
                          ticket.customerEmail}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            priorityStyles[ticket.priority] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[ticket.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {ticket.assignee || "Unassigned"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                        {ticket.updatedAt
                          ? new Date(ticket.updatedAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-500">
          {tickets.length} ticket{tickets.length === 1 ? "" : "s"} displayed
        </p>
      </div>
    </section>
  );
}