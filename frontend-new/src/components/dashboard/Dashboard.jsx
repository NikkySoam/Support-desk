import { useEffect, useState } from "react";
import api from "../../lib/api";

const dashboardCards = [
  {
    key: "totalTickets",
    title: "Total Tickets",
    color: "bg-blue-100 text-blue-700",
  },
  {
    key: "openTickets",
    title: "Open Tickets",
    color: "bg-sky-100 text-sky-700",
  },
  {
    key: "inProgressTickets",
    title: "In Progress",
    color: "bg-amber-100 text-amber-700",
  },
  {
    key: "resolvedTickets",
    title: "Resolved",
    color: "bg-green-100 text-green-700",
  },
  {
    key: "urgentTickets",
    title: "Urgent Tickets",
    color: "bg-red-100 text-red-700",
  },
  {
    key: "overdueTickets",
    title: "Overdue Tickets",
    color: "bg-purple-100 text-purple-700",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard/stats");
        setStats(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="m-6 rounded-lg bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-900">
            Support Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Overview of your support team's ticket activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card) => (
            <div
              key={card.key}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-gray-600">
                  {card.title}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${card.color}`}
                >
                  Tickets
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-gray-900">
                {stats[card.key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}