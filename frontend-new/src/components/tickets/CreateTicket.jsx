import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const initialForm = {
  subject: "",
  customerName: "",
  customerEmail: "",
  description: "",
  priority: "Medium",
  status: "Open",
  assignee: "",
};

export default function CreateTicket() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.customerName.trim() && !form.customerEmail.trim()) {
      setError("Enter at least a customer name or email address.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        subject: form.subject.trim(),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        description: form.description.trim(),
        assignee: form.assignee.trim(),
      };

      const response = await api.post("/tickets", payload);

      const createdTicket = response.data.data ?? response.data;

      if (!createdTicket?._id) {
        throw new Error("Ticket was created, but its ID was not returned.");
      }

      navigate(`/tickets/${createdTicket._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="mb-5 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to tickets
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Support Ticket
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Enter the customer's details and describe the issue.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject *
              </label>

              <input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="e.g. Unable to access my account"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="customerName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Customer Name
                </label>

                <input
                  id="customerName"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Customer name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="customerEmail"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Customer Email
                </label>

                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <p className="-mt-3 text-xs text-gray-500">
              Provide at least a customer name or email address.
            </p>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description *
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                maxLength={5000}
                rows={5}
                placeholder="Describe the customer's issue..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting on Customer">
                    Waiting on Customer
                  </option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="assignee"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Assign To
              </label>

              <input
                id="assignee"
                name="assignee"
                value={form.assignee}
                onChange={handleChange}
                placeholder="Agent name (optional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/tickets")}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}