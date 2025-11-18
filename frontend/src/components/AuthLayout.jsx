import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Building2, ShieldCheck, CreditCard } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50" dir="rtl">
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.45), transparent 35%),' +
          'radial-gradient(circle at 80% 0%, rgba(14,165,233,0.4), transparent 30%),' +
          'radial-gradient(circle at 50% 80%, rgba(16,185,129,0.35), transparent 30%)',
      }} />
      <div className="absolute -left-10 top-16 w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full animate-float-slow" />
      <div className="absolute -right-10 bottom-10 w-80 h-80 bg-emerald-400/20 blur-3xl rounded-full animate-float" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.07),_transparent_35%)]"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
         <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-10 items-center text-right">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 border border-white/10">
              <Sparkles size={16} className="text-cyan-300" />
              <span className="text-sm">سامانه هوشمند شهرک آتیساز</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-sm">{title || 'به آتیساز خوش آمدید'}</h1>
              <p className="text-slate-200 leading-relaxed max-w-xl">
                {subtitle || 'دسترسی سریع به پرداخت شارژ، مدیریت درخواست‌ها، اطلاع‌رسانی و خدمات شهری با ظاهری یک‌دست و مدرن.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-100">
              {[{ icon: Building2, label: 'مدیریت یکپارچه واحدها' }, { icon: ShieldCheck, label: 'امنیت و احراز هویت' }, { icon: CreditCard, label: 'پرداخت‌های ساده' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
                  <Icon size={18} className="text-cyan-300" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/60"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
