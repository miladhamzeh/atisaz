import { useState } from "react";
import { Menu, X,User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const roleLabels = {
  admin: 'مدیر سیستم',
  secretary: 'منشی',
  accountant: 'حسابدار',
  facilities: 'مسئول فنی',
  technician: 'مسئول فنی',
  lobbyman: 'لابی‌من',
  security: 'نگهبان',
  user: 'ساکن',
};

export default function Header({ title = 'آتيساز', links = [], onLogout = () => {}, user }) {
  const [open, setOpen] = useState(false);
  const roleKey = (user?.role || '').toLowerCase();
  const roleLabel = roleLabels[roleKey] || user?.role;

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-gradient-to-l from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-lg">
     <div className="flex justify-between items-center px-6 py-4 gap-3 text-white">
       <h1 className="text-xl font-bold drop-shadow-sm text-white/90">سامانه مدیریت شهرک  {title} </h1>
       <div className="flex items-center gap-3">
         {user && (
           <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-white/10 shadow-sm">
              <User size={18} className="text-cyan-300" />
              <div className="leading-tight text-right">
              <div className="text-sm font-semibold text-white">{user.name || 'کاربر'}</div>
               <div className="text-xs text-white/70">{roleLabel}</div>
             </div>
           </div>
         )}
         <button
           onClick={() => setOpen(!open)}
           className="text-white focus:outline-none"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900/80 border-t border-white/10 shadow-inner backdrop-blur-xl text-white"
         >
         <ul className="flex flex-col divide-y divide-white/10 text-right">
              {user && (
                <li className="px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-200 flex items-center justify-center font-bold">
                   {(user.name || 'کاربر')[0]}
                 </div>
                 <div className="leading-tight text-right">
                 <div className="font-semibold text-white">{user.name || 'کاربر'}</div>
                                    <div className="text-xs text-white/70">{roleLabel || '—'}</div>
                                  </div>
                                </li>
                              )}
                              {links.map((link) => (
                                <li key={link.path}>
                                  <a
                                    href={link.path}
                                    onClick={() => setOpen(false)}
                                    className="block px-6 py-3 text-white/85 hover:bg-white/5 hover:text-cyan-200 transition text-right"
                                  >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
            <div className="px-6 py-3 flex justify-end">
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-rose-200 font-medium hover:bg-rose-500/15 hover:text-rose-100 transition"
                >
                  خروج
                </button>
              </div>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
