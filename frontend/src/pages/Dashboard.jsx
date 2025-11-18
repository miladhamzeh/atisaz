// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {useNavigate , Link } from "react-router-dom";
import AppShell from "../components/AppShell";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchSummary = async () => {
      try {
        const res = await api.get("/users/summary");
        setSummary(res.data);
      } finally { setLoading(false); }
    };
    fetchSummary();
  }, [user, navigate]);

  if (!user) return null;

  const role = (user.role || "resident").toLowerCase();

  return (
    <AppShell
      title="پیشخوان"
      subtitle="همه وظایف در یک نگاه متناسب با نقش شما"
      actions={<div className="text-sm text-slate-500">{user.name} – {user.role}</div>}
    >
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Tile to="/balance" title="کیف پول" desc="مشاهده شارژها و پرداخت" />
        <Tile to="/moving" title="اسباب‌کشی" desc="ثبت و مدیریت درخواست‌ها" />
        <Tile to="/issues" title="خرابی و تعمیرات" desc="اعلام یا پیگیری" />
        <Tile to="/news" title="اخبار و اطلاعیه" desc="مشاهده و مدیریت" />
        <Tile to="/voting" title="رای‌گیری / نظرسنجی" desc="مشارکت یا ایجاد" />
        <Tile to="/tickets" title="تیکت و پیام" desc="مکاتبه با کادر" />
      </div>

      <RolePanels role={role} />

      {summary && (
        <div className="mt-8 bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">خلاصه وضعیت</h3>
          {"me" in summary ? (
            <div className="grid sm:grid-cols-2 gap-3 text-slate-700">
              <p>تعداد شارژ پرداخت نشده: {summary.unpaidCharges}</p>
              <p>جمع پرداخت‌ها: {summary.paymentsSum}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3 text-slate-700">
              <p>تعداد کاربران: {summary.totalUsers}</p>
              <p>واحدها: {summary.totalUnits}</p>
              <p>تیکت‌های باز: {summary.openTickets}</p>
              <p>شارژ پرداخت نشده: {summary.unpaidCharges}</p>
              <p>جمع پرداخت‌ها: {summary.totalPayments}</p>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function Tile({ to, title, desc }) {
  return (
    <Link to={to} className="bg-white/80 backdrop-blur border border-slate-100 p-5 rounded-2xl shadow hover:shadow-lg transition block">
     <h3 className="text-lg font-semibold mb-2 text-slate-800">{title}</h3>
     <p className="text-sm text-slate-600">{desc}</p>
    </Link>
  );
}
function RolePanels({ role }) {
  if (role === "secretary") {
    return (
      <Panel title="فضای کاری منشی" items={[
        { title: "مدیریت اخبار", desc: "ایجاد، ویرایش و حذف اطلاعیه‌ها", to: "/news" },
        { title: "درخواست‌های ساکنین", desc: "اسباب‌کشی، اصلاح اطلاعات و ...", to: "/moving" },
        { title: "رای‌گیری و نظرسنجی", desc: "ایجاد نظرسنجی جدید یا رای‌گیری مدت‌دار", to: "/voting" },
        { title: "تیکت‌ها", desc: "پاسخ به پیام‌های ساکنین", to: "/tickets" },
      ]} />
    );
  }
  if (role === "accountant") {
    return (
      <Panel title="پیشخوان حسابداری" items={[
        { title: "شارژ جاری و عمرانی", desc: "تعریف شارژ و پایش پرداخت‌ها", to: "/balance" },
        { title: "درخواست‌های اسباب‌کشی", desc: "بررسی و تایید یا رد", to: "/moving" },
        { title: "گزارش خرابی‌ها", desc: "مشاهده تاثیر مالی و بدهی‌ها", to: "/issues" },
        { title: "تیکت‌ها", desc: "مکاتبه مستقیم با واحدها", to: "/tickets" },
      ]} />
    );
  }
  if (role === "technician") {
    return (
      <Panel title="پیشخوان فنی" items={[
        { title: "خرابی‌های ثبت شده", desc: "مشاهده و تغییر وضعیت خرابی‌ها", to: "/issues" },
        { title: "تیکت‌های فنی", desc: "پاسخ به درخواست‌های مرتبط", to: "/tickets" },
      ]} />
    );
  }
  if (role === "lobbyman" || role === "security") {
    return (
      <Panel title="ورود و خروج" items={[
        { title: "درخواست‌های اسباب‌کشی", desc: "اطلاع از زمان‌بندی و وضعیت", to: "/moving" },
        { title: "تیکت‌ها", desc: "پیگیری پیام‌های ساکنین", to: "/tickets" },
      ]} />
    );
  }
  return null;
}

function Panel({ title, items }) {
  return (
    <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
      <h3 className="text-xl font-semibold text-slate-800 mb-3">{title}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link key={item.title} to={item.to} className="p-4 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 hover:border-indigo-200 transition">
            <div className="font-semibold text-slate-800">{item.title}</div>
            <div className="text-sm text-slate-600 mt-1">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
