import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/tickets", label: "Tickets" },
];

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <NavLink to="/" className="text-xl font-bold text-blue-700">
          Support Desk
        </NavLink>

        <div className="flex items-center gap-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-600 hover:text-blue-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <NavLink
            to="/tickets/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Create Ticket
          </NavLink>
        </div>
      </div>
    </nav>
  );
}