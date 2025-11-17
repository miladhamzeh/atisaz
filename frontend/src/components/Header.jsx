import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ title, links, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      {/* نوار بالا */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold text-gray-700">{title}</h1>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-600 focus:outline-none"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* منوی برگر */}
      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-gray-50 border-t border-gray-200 shadow-inner"
          >
            <ul className="flex flex-col divide-y divide-gray-200">
              {links.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={() => setOpen(false)}
                    className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-6 py-3 text-red-600 font-medium hover:bg-red-50 transition"
                >
                  خروج
                </button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
