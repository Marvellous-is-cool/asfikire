import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaChartPie,
  FaUsers,
  FaCreditCard,
  FaFileExport,
  FaCog,
  FaTshirt,
  FaSignOutAlt,
} from "react-icons/fa";

export default function AdminNav({ onLogout }) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: FaChartPie },
    { name: "Payments", href: "/admin/payments", icon: FaCreditCard },
    { name: "Users", href: "/admin/users", icon: FaUsers },
    { name: "Voting Results", href: "/admin/results", icon: FaTshirt },
    { name: "Export Data", href: "/admin/export", icon: FaFileExport },
    { name: "Settings", href: "/admin/settings", icon: FaCog },
  ];

  return (
    <div className="bg-white border-r min-h-screen w-64 py-6 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="px-6">
          <h2 className="text-xl font-bold text-primary-700 mb-1">
            Admin Portal
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Anglican Student Fellowship
          </p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={`flex items-center px-3 py-3 rounded-lg relative ${
                        isActive
                          ? "text-primary-700 bg-primary-50 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.name}</span>

                      {isActive && (
                        <motion.div
                          layoutId="active-nav-indicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full"
                        />
                      )}

                      {hoveredItem === item.name && !isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 rounded-r-full"
                        />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 mt-6">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
