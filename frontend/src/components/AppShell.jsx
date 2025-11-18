import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

const baseLinks = [
  { label: 'پیشخوان', path: '/dashboard' },
  { label: 'کیف پول و شارژ', path: '/balance' },
  { label: 'اسباب‌کشی', path: '/moving' },
  { label: 'اعلام خرابی', path: '/issues' },
  { label: 'اخبار', path: '/news' },
  { label: 'رای‌گیری', path: '/voting' },
  { label: 'اصلاح اطلاعات', path: '/data-correction' },
  { label: 'بازسازی', path: '/renovation' },
  { label: 'تیکت‌ها', path: '/tickets' },
  { label: 'فروم', path: '/forum' }
];

const linksByRole = {
  admin: baseLinks,
  secretary: [
    { label: 'پیشخوان', path: '/dashboard' },
    { label: 'گزارش کیف پول', path: '/balance' },
    { label: 'درخواست‌های اسباب‌کشی', path: '/moving' },
    { label: 'خرابی‌ها', path: '/issues' },
    { label: 'مدیریت اخبار', path: '/news' },
    { label: 'رای‌گیری و نظرسنجی', path: '/voting' },
    { label: 'اصلاح اطلاعات', path: '/data-correction' },
    { label: 'تیکت‌ها', path: '/tickets' },
  ],
  accountant: [
    { label: 'پیشخوان مالی', path: '/dashboard' },
    { label: 'شارژ و پرداخت‌ها', path: '/balance' },
    { label: 'اسباب‌کشی', path: '/moving' },
    { label: 'تیکت‌ها', path: '/tickets' },
  ],
 technician: [
   { label: 'پیشخوان', path: '/dashboard' },
   { label: 'خرابی‌ها', path: '/issues' },
   { label: 'تیکت‌ها', path: '/tickets' },
 ],
 lobbyman: [
   { label: 'پیشخوان', path: '/dashboard' },
   { label: 'اسباب‌کشی', path: '/moving' },
   { label: 'تیکت‌ها', path: '/tickets' },
 ],
 security: [
   { label: 'پیشخوان', path: '/dashboard' },
   { label: 'اسباب‌کشی', path: '/moving' },
   { label: 'تیکت‌ها', path: '/tickets' },
 ],
 default: baseLinks,
};

export default function AppShell({ title, subtitle, actions, children }) {
 const { user, logout } = useAuth();
 const roleKey = (user?.role || '').toLowerCase();
 const nav = linksByRole[roleKey] || linksByRole.default;

 return (
   <div
      dir="rtl"
      className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 18%, rgba(99,102,241,0.28), transparent 35%),' +
            'radial-gradient(circle at 82% 12%, rgba(14,165,233,0.24), transparent 32%),' +
            'radial-gradient(circle at 55% 88%, rgba(16,185,129,0.25), transparent 32%)',
        }}
      />
      <div className="absolute -left-12 top-10 w-72 h-72 bg-indigo-500/25 blur-3xl rounded-full animate-float-slow" />
      <div className="absolute -right-10 bottom-12 w-80 h-80 bg-emerald-400/20 blur-3xl rounded-full animate-float" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_35%)]" />

      <Header title="آتيساز" links={nav} onLogout={logout} user={user} />
      <div className="relative z-10 p-6 pt-24 max-w-6xl mx-auto space-y-6">
        {(title || subtitle || actions) && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-right">
             {subtitle && <p className="text-sm text-slate-200/80">{subtitle}</p>}
             {title && <h2 className="text-3xl font-semibold text-white drop-shadow-sm">{title}</h2>}
           </div>
           {actions}
         </div>
       )}
       <div className="bg-white/90 text-slate-900 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-4 sm:p-6">
          {children}
        </div>
        <Footer />
   </div>
 </div>
);
}
