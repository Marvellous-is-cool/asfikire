import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartPie,
  FaUsers,
  FaCreditCard,
  FaFileExport,
  FaCog,
  FaTshirt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function AdminMobileNav({ onLogout }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: FaChartPie },
    { name: "Payments", href: "/admin/payments", icon: FaCreditCard },
    { name: "Users", href: "/admin/users", icon: FaUsers },
    { name: "Voting Results", href: "/admin/results", icon: FaTshirt },
    { name: "Export Data", href: "/admin/export", icon: FaFileExport },
    { name: "Settings", href: "/admin/settings", icon: FaCog },
  ];

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold text-primary-700">Admin Portal</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-white border-b shadow-lg"
          >
            <nav>
              <ul className="p-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link href={item.href}>
                        <div
                          className={`flex items-center px-4 py-3 rounded-lg ${
                            isActive
                              ? "text-primary-700 bg-primary-50 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}

                <li>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <FaSignOutAlt className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
