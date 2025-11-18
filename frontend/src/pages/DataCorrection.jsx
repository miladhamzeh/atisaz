// src/pages/DataCorrection.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

export default function DataCorrection() {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMine = async () => {
    // secretary/admin will use separate views; users can see their own via default controller filtering when not passing role
    try {
     setLoading(true);
     const res = await api.get('/data-corrections');
     setRequests(res.data || []);
   } finally {
     setLoading(false);
   }
  };

  useEffect(() => { fetchMine(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/data-corrections', { message });
    setMessage(''); await fetchMine(); alert('درخواست شما با موفقیت ارسال شد');
  };

  const process = async (id, payload) => {
     await api.put(`/data-corrections/${id}`, payload);
     setNotes('');
     await fetchMine();
   };

   const statusBadge = (status) => {
     const map = {
       pending: 'در انتظار بررسی',
       sent_to_admin: 'منتظر تایید ادمین',
       approved: 'تایید شد',
       denied: 'رد شد'
     };
     return map[status] || status;
   };

   const canActAsSecretary = role === 'secretary';
   const canActAsAdmin = role === 'admin';
   const canSubmit = !['secretary','admin','accountant','technician','lobbyman','security'].includes(role);
  return (
    <AppShell title="اصلاح اطلاعات" subtitle="مدیریت و رسیدگی به درخواست‌های اصلاح پروفایل و واحد">
      <div className="grid lg:grid-cols-[1.5fr,1fr] gap-6">
        {(canActAsSecretary || canActAsAdmin) && (
          <div className="bg-white/90 rounded-2xl shadow border border-slate-100/70 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">درخواست‌های ارسالی</h3>
                <p className="text-sm text-slate-600">مشاهده جزئیات، واحد و وضعیت هر درخواست</p>
              </div>
              {loading && <span className="text-xs text-slate-500">در حال بارگذاری...</span>}
            </div>

            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {requests.map((r) => (
                <div key={r._id} className="p-4 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-slate-900 font-semibold">{r.user?.name || 'کاربر'}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-xs">{statusBadge(r.status)}</span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">واحد: {r.unit?.number || r.unit?.name || 'نامشخص'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mt-2 leading-7 whitespace-pre-wrap">{r.message}</p>
                  {r.proposedChanges && (
                    <div className="text-xs text-slate-500 mt-1">تغییرات پیشنهادی: {JSON.stringify(r.proposedChanges)}</div>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span>تاریخ: {new Date(r.createdAt).toLocaleString()}</span>
                  </div>

                  {(canActAsSecretary && r.status === 'pending') && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => process(r._id, { secretaryDecision: 'accepted', notes })}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm shadow"
                      >
                        تایید و ارسال برای ادمین
                      </button>
                      <button
                        onClick={() => process(r._id, { secretaryDecision: 'rejected', notes })}
                        className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm shadow"
                      >
                        رد درخواست
                      </button>
                      <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="یادداشت اختیاری"
                        className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  )}

                  {(canActAsAdmin && r.status === 'sent_to_admin') && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => process(r._id, { adminDecision: 'approved', adminNote: notes })}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm shadow"
                      >
                        تایید نهایی
                      </button>
                      <button
                        onClick={() => process(r._id, { adminDecision: 'denied', adminNote: notes })}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm shadow"
                      >
                        عدم تایید
                      </button>
                      <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="یادداشت ادمین"
                        className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}

              {!loading && requests.length === 0 && (
                <div className="text-slate-500 text-sm">درخواستی برای نمایش وجود ندارد.</div>
              )}
            </div>
          </div>
        )}

        {canSubmit && (
          <div className="bg-white/90 rounded-2xl shadow border border-slate-100/70 p-5">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">شرح تغییرات</h3>
            <form onSubmit={submit} className="space-y-3">
              <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="مثلاً تغییر شماره تماس یا پلاک خودرو"
className="w-full p-3 border rounded-lg border-slate-200 min-h-[120px] bg-white/80" />
              <button className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow">ارسال برای منشی</button>
            </form>
          </div>
        )}
        <div className="bg-white/90 rounded-2xl shadow border border-slate-100/70 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {canSubmit ? 'درخواست‌های من' : 'همه درخواست‌ها'}
                  </h3>
                  <ul className="space-y-2 max-h-[420px] overflow-auto pr-1">
                  {requests.map(r => (
              <li key={r._id} className="p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50">
              <div className="flex items-center justify-between gap-2">
                 <div className="font-semibold text-slate-800">{statusBadge(r.status)}</div>
                 <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
               </div>
               <div className="text-sm text-slate-600 mt-1">{r.message}</div>
               </li>
          ))}
          {!loading && requests.length === 0 && <li className="text-gray-500">درخواستی ثبت نشده است.</li>}
         </ul>
       </div>
     </div>
   </AppShell>
 );
}
