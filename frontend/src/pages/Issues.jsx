// src/pages/Issues.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

const categories = [
  { value: 'opt1', label: 'آب' },
  { value: 'opt2', label: 'برق' },
  { value: 'opt3', label: 'گاز' },
  { value: 'opt4', label: 'آسانسور' },
  { value: 'opt5', label: 'نظافت' },
  { value: 'opt6', label: 'سایر' },
];

const statusOptions = [
  { value: 'pending', label: 'ثبت شده' },
  { value: 'in_progress', label: 'در حال پیگیری' },
  { value: 'resolved', label: 'برطرف شد' },
  { value: 'removed', label: 'لغو/عدم موفقیت' },
];

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-100',
  in_progress: 'bg-sky-50 text-sky-700 border border-sky-100',
  resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  removed: 'bg-rose-50 text-rose-700 border border-rose-100',
};

export default function Issues() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState(categories[0].value);
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [updateNotes, setUpdateNotes] = useState({});
  const role = (user?.role || '').toLowerCase();
  const canManage = ['facilities'].includes(role);
  const canSeeReporter = ['facilities', 'secretary', 'admin'].includes(role);

 if (role === 'accountant') {
   return (
     <AppShell title="اعلام خرابی" subtitle="این بخش برای حسابداری فعال نیست">
       <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-6 text-slate-700">
         دسترسی مشاهده و مدیریت خرابی‌ها برای نقش حسابدار غیرفعال است.
       </div>
     </AppShell>
   );
 }
  const fetchIssues = async () => {
    const res = await api.get('/issues');
    setIssues(res.data);
  };

  useEffect(() => { fetchIssues(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/issues', { unitId: user.unit, title, description: desc, category });
      setTitle('');
      setDesc('');
      await fetchIssues();
      alert('گزارش ثبت شد');
    } catch {
      alert('Failed to report issue');
    }
  };

  const updateStatus = async (issueId, status) => {
    try {
      const payload = { status };
      if (updateNotes[issueId]) payload.comment = updateNotes[issueId];
      await api.put(`/issues/${issueId}/status`, payload);
      await fetchIssues();
      setUpdateNotes(prev => ({ ...prev, [issueId]: '' }));
    } catch {
      alert('به‌روزرسانی انجام نشد');
    }
  };

  return (
    <AppShell title="اعلام خرابی" subtitle="ثبت خرابی و پیگیری وضعیت توسط مسئول فنی">
    <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow-lg p-5">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">گزارش خرابی جدید</h3>
          <p className="text-sm text-slate-500 mb-4">شرح دقیق خرابی را ثبت کنید تا مسئول فنی پیگیری کند.</p>
          <form onSubmit={submit} className="space-y-3">
          <input
             value={title}
             onChange={e=>setTitle(e.target.value)}
             placeholder="عنوان"
             className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100"
           />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <select
               value={category}
               onChange={e=>setCategory(e.target.value)}
               className="p-3 border border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-100"
             >
               {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
             </select>
             <input
               disabled
               value={user?.unitName || ''}
               placeholder="واحد"
               className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
             />
           </div>
           <textarea
             value={desc}
             onChange={e=>setDesc(e.target.value)}
             placeholder="شرح مشکل"
             rows={4}
             className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100"
           />
           <button className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-3 rounded-lg w-full font-semibold shadow">
             ثبت گزارش
           </button>
         </form>
       </div>
       <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">لیست خرابی‌ها</h3>
              <p className="text-sm text-slate-500">جزئیات هر خرابی و آخرین وضعیت را ببینید.</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">فیلتر وضعیت:</span>
              <select value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 border border-slate-200 rounded-lg bg-white">
                <option value="all">همه</option>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <ul className="space-y-3 max-h-[560px] overflow-auto pr-1">
         {issues.length === 0 && <li className="text-slate-500">موردی ثبت نشده است.</li>}
         {issues
             .filter(i => filter === 'all' || i.status === filter)
             .map(i => {
               const categoryLabel = (categories.find(c=>c.value===i.category)||{}).label || i.category;
               const statusLabel = (statusOptions.find(s=>s.value===i.status)||{}).label || i.status;
               const reporterName = i.reportedBy?.name || 'نامشخص';
               const reporterRole = i.reportedBy?.role || '';
               const reporterUnit = i.unit?.number
                  || i.reportedBy?.unitName
                  || (typeof i.reportedBy?.unit === 'string' ? i.reportedBy.unit : '')
                  || (typeof i.unit === 'string' ? i.unit : '')
                  || i.unitName;
               return (
                 <li key={i._id} className="p-4 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 shadow-sm">
                   <div className="flex items-start justify-between gap-3 flex-wrap">
                     <div className="space-y-1">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="font-semibold text-slate-800">{i.title}</span>
                         <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{categoryLabel}</span>
                       </div>
                       <div className="text-sm text-slate-600 leading-relaxed">{i.description || '—'}</div>
                       <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center gap-2">
                         <span>ثبت: {new Date(i.createdAt).toLocaleString()}</span>
                         {i.closedAt && <span className="hidden sm:inline">•</span>}
                         {i.closedAt && <span>اتمام: {new Date(i.closedAt).toLocaleString()}</span>}
                         {canSeeReporter && (
                           <span className="sm:ml-2 flex items-center gap-2 flex-wrap text-slate-600">
                             <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">گزارش‌دهنده: {reporterName}{reporterRole ? ` (${reporterRole})` : ''}</span>
                             {reporterUnit && (
                               <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">واحد: {reporterUnit}</span>
                             )}
                           </span>
                        )}
                       </div>
                     </div>
                     <div className="flex flex-col items-end gap-2 min-w-[140px]">
                       <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[i.status] || 'bg-slate-50 text-slate-700 border'}`}>{statusLabel}</span>
                       {i.assignedTo && <span className="text-xs text-slate-500">مسئول: {i.assignedTo?.name || 'نامشخص'}</span>}
                     </div>
                   </div>

                   {canManage && (
                     <div className="mt-3 space-y-2">
                       <textarea
                         value={updateNotes[i._id] || ''}
                         onChange={e => setUpdateNotes(prev => ({ ...prev, [i._id]: e.target.value }))}
                         placeholder="توضیح/کامنت برای تغییر وضعیت"
                         className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100"
                         rows={2}
                       />
                       <div className="flex flex-wrap gap-2">
                         {statusOptions.map(opt => (
                           <button
                             key={opt.value}
                             type="button"
                             onClick={() => updateStatus(i._id, opt.value)}
                             className={`px-3 py-2 rounded-lg text-sm border transition ${i.status === opt.value ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                           >
                             {opt.label}
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </li>
               );
             })}
         </ul>
       </div>
     </div>
   </AppShell>
 );
}
