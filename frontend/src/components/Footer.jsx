import React from 'react';
import { Mail, PhoneCall, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-10 text-sm text-slate-600">
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 backdrop-blur-lg shadow-lg">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-indigo-50 via-slate-50 to-cyan-50" />
        <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-indigo-100 blur-3xl opacity-70" />
        <div className="absolute -right-6 -bottom-4 h-24 w-24 rounded-full bg-cyan-100 blur-3xl opacity-70" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-indigo-700 font-medium">
            <Sparkles size={18} className="text-indigo-500" />
            <span>طراحی و اجرا شده توسط میلاد حمزه</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-700">
            <div className="flex items-center gap-2">
              <PhoneCall size={16} className="text-indigo-500" />
              <span className="font-semibold text-slate-800">۰۹۱۲۸۰۰۱۸۰۶ </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-indigo-500" />
              <span dir="ltr" className="text-slate-800">milad.hamzeh@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
