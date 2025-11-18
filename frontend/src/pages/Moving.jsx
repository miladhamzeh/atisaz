// src/pages/Moving.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

const statusOptions = [
  { value: 'pending', label: 'در انتظار بررسی' },
  { value: 'approved', label: 'تایید شد' },
  { value: 'scheduled', label: 'زمان‌بندی شد' },
  { value: 'denied', label: 'رد شد' },
  { value: 'cancelled', label: 'لغو شد' },
];

export default function Moving() {
  const { user } = useAuth();
  const [type, setType] = useState('move_in');
  const [scheduledDate, setScheduledDate] = useState('');
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const unitId = user?.unit;
    const role = (user?.role || '').toLowerCase();
    const canManage = ['secretary', 'accountant', 'admin', 'lobbyman', 'security'].includes(role);
  const canSubmit = role === 'user';
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/moves', { params: unitId && !canManage ? { unitId } : {} });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to load move requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/moves', { unitId, type, scheduledDate, reason });
      setReason('');
      setScheduledDate('');
      await fetchRequests();
      alert('درخواست جابجایی با موفقیت ارسال شد');
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در لود درخواستهای جابجایی');
    }
  };
  const updateStatus = async (id, status) => {
    try {
      if (status === 'approved') {
      await api.put(`/moves/${id}/approve`);
    } else if (status === 'denied') {
      await api.put(`/moves/${id}/deny`);
    } else {
      await api.patch(`/moves/${id}`, { action: status });
     }
     await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'به‌روزرسانی انجام نشد');
    }
  };

  return (
    <AppShell
      title="درخواست اسباب‌کشی"
      subtitle="اطلاع‌رسانی سریع به منشی، حسابدار و لابی"
      actions={canManage ? <span className="text-sm text-slate-500">نمایش همه درخواست‌ها برای نقش {user.role}</span> : null}>
      <div className="grid lg:grid-cols-2 gap-6">

      {canSubmit ? (
       <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
         <h3 className="text-lg font-semibold text-slate-800 mb-2">ثبت درخواست جدید</h3>
         <form onSubmit={submit} className="space-y-3">
           <div>
             <label className="block text-sm text-slate-600 mb-1">نوع</label>
             <select value={type} onChange={e=>setType(e.target.value)} className="p-3 border border-slate-200 rounded-lg w-full">
               <option value="move_in">ورود</option>
               <option value="move_out">خروج</option>
             </select>
           </div>
           <div>
             <label className="block text-sm text-slate-600 mb-1">تاریخ پیشنهادی</label>
             <input type="date" value={scheduledDate} onChange={e=>setScheduledDate(e.target.value)} className="p-3 border border-slate-200 rounded-lg w-full" />
           </div>
           <div>
             <label className="block text-sm text-slate-600 mb-1">توضیحات</label>
             <textarea value={reason} onChange={e=>setReason(e.target.value)} className="p-3 border border-slate-200 rounded-lg w-full" placeholder="توضیحاتی برای منشی و حسابداری" />
           </div>
           <button className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">ارسال درخواست</button>
         </form>
       </div>
     ) : (
       <div className="bg-slate-50 border border-slate-100 rounded-2xl shadow p-5 text-slate-700">
         ثبت یا مشاهده درخواست اسباب‌کشی فقط برای ساکنین و واحدهای مرتبط فعال است؛ شما در نقش {user.role} فقط لیست‌ها و تاییدها را می‌بینید.
       </div>
     )}
        <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
         <div className="flex items-center justify-between mb-3">
           <h3 className="text-lg font-semibold text-slate-800">لیست درخواست‌ها</h3>
           {loading && <span className="text-sm text-slate-500">در حال بارگذاری...</span>}
         </div>
         {requests.length === 0 && <p className="text-slate-500">درخواستی ثبت نشده است.</p>}
         <ul className="space-y-3 max-h-[520px] overflow-auto pr-1">
           {requests.map((r) => (
             <li key={r._id} className="p-4 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50">
               <div className="flex items-center justify-between gap-3 flex-wrap">
                 <div>
                     <div className="font-semibold text-slate-800">{r.type === 'move_in' ? 'ورود' : 'خروج'} – {(statusOptions.find(s=>s.value===r.status)||{}).label || r.status}</div>
                   <div className="text-xs text-slate-500">{r.assessedDebt > 0 ? `بدهی محاسبه شده: ${r.assessedDebt}` : 'بدون بدهی'}</div>
                   {canManage && (
                      <div className="text-xs text-indigo-700 mt-1">
                        درخواست توسط {r.applicant?.name || 'نامشخص'} (واحد {r.unit?.number || 'نامشخص'})
                      </div>
                    )}
                   <div className="text-sm text-slate-600 mt-1">{r.reason}</div>
                 </div>
                 <div className="text-xs text-slate-500 text-right">
                   {r.scheduledDate && <div>تاریخ: {new Date(r.scheduledDate).toLocaleDateString()}</div>}
                   <div>{new Date(r.createdAt).toLocaleString()}</div>
                 </div>
              </div>
              {canManage && (
                 <div className="mt-3 flex flex-wrap gap-2">
                   {statusOptions.map((opt) => (
                     <button
                       key={opt.value}
                       onClick={() => updateStatus(r._id, opt.value)}
                       className={`px-3 py-2 rounded-lg text-sm border ${r.status === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 bg-white'}`}
                     >
                       {opt.label}
                     </button>
                   ))}
                 </div>
               )}
             </li>
           ))}
        </ul>
      </div>
      </div>
    </AppShell>
  );
}
