// src/pages/Voting.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

export default function Voting() {
  const [polls, setPolls] = useState([]);
  const [selection, setSelection] = useState({});

  const fetchPolls = async () => { const res = await api.get('/polls'); setPolls(res.data); };
  useEffect(() => { fetchPolls(); }, []);
  const [title, setTitle] = useState('');
  const { user } = useAuth();
 const [description, setDescription] = useState('');
 const [options, setOptions] = useState(['', '']);
 const [type, setType] = useState('vote');
 const [endDate, setEndDate] = useState('');
 const role = (user?.role || '').toLowerCase();
 const canCreate = ['secretary', 'admin'].includes(role);
 const isAdmin = role === 'admin';
 const canVote = role === 'user';

  const vote = async (pollId) => {

    try {
      if (!canVote) return alert('فقط ساکنین می‌توانند در رای‌گیری شرکت کنند');
     const sel = selection[pollId];
     if (!sel) return alert('یک گزینه انتخاب کنید');
     await api.post(`/polls/${pollId}/vote`, { selectedOptionIds: sel });
     alert('رای ثبت شد'); await fetchPolls();
   } catch (err) {
     alert(err.response?.data?.error || 'ثبت رای ناموفق بود');
   }
  };
  const createPoll = async (e) => {
      e.preventDefault();
      try {
        const filtered = options.filter((o) => o.trim() !== '');
        if (filtered.length < 2) return alert('حداقل دو گزینه لازم است');
        await api.post('/polls', { title, description, type, options: filtered,endAt: endDate });
        setTitle(''); setDescription(''); setOptions(['', '']); setEndDate('');
        await fetchPolls();
      } catch (err) {
        alert(err.response?.data?.error || 'ایجاد رای‌گیری ناموفق بود');
      }
    };

    const handleOptionChange = (index, value) => {
      setOptions((prev) => {
        const copy = [...prev];
        copy[index] = value;
        return copy;
      });
    };

    const addOption = () => setOptions((prev) => [...prev, '']);

  return (
    <AppShell title="رای‌گیری و نظرسنجی" subtitle="شفاف و مخفی برای رای‌گیری، با نتایج لحظه‌ای برای نظرسنجی">
      {canCreate && (
        <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">ایجاد رای‌گیری / نظرسنجی</h3>
          <form onSubmit={createPoll} className="space-y-3">
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg" placeholder="عنوان" />
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg" placeholder="توضیحات" />
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">نوع</label>
                <select value={type} onChange={e=>setType(e.target.value)} className="p-3 border border-slate-200 rounded-lg w-full">
                  <option value="vote">رای‌گیری مخفی</option>
                  <option value="poll">نظرسنجی با نمایش نتایج</option>
                </select>
              </div>
              <div>
           <label className="block text-sm text-slate-600 mb-1">تاریخ پایان (اختیاری)</label>
           <input type="datetime-local" value={endDate} onChange={e=>setEndDate(e.target.value)} className="p-3 border border-slate-200 rounded-lg w-full" />
         </div>
       </div>
       <div className="space-y-2">
         <div className="text-sm text-slate-600">گزینه‌ها</div>
         {options.map((opt, idx) => (
           <input key={idx} value={opt} onChange={e=>handleOptionChange(idx, e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg" placeholder={`گزینه ${idx+1}`} />
         ))}
         <button type="button" onClick={addOption} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">افزودن گزینه</button>
       </div>
       <button className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold">ایجاد</button>
        </form>
      </div>
    )}

    <div className="space-y-4">
    {polls.map(p => (
                <div key={p._id} className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{p.title} <span className="text-xs text-gray-500">({p.type === 'poll' ? 'نظرسنجی' : 'رای‌گیری'})</span></h3>
             {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
             {p.endAt && <p className="text-xs text-amber-600 mt-1">مهلت تا {new Date(p.endAt).toLocaleString()}</p>}
           </div>
           <div className="flex flex-col items-end gap-2 text-xs">
             {p.hasVoted && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">رای شما ثبت شده</span>}
             {p.endAt && new Date(p.endAt) < new Date() && <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-700">پایان یافته</span>}
           </div>
         </div>

         <div className="mt-3 space-y-2">
                  {p.options.map(opt => (
                    <label key={opt._id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`poll-${p._id}`}
                        disabled={!canVote || p.hasVoted || (p.endAt && new Date(p.endAt) < new Date())}
                        onChange={() => setSelection(prev => ({ ...prev, [p._id]: opt._id }))}
                      />
                      <span>{opt.label}</span>
                      {p.type === 'poll' && (canVote || isAdmin) && <span className="text-xs text-slate-500">{opt.votesCount ?? 0} رای</span>}
                    </label>
                  ))}
                </div>
                <button
                  className="mt-3 bg-indigo-600 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canVote || p.hasVoted || (p.endAt && new Date(p.endAt) < new Date())}
                  onClick={() => vote(p._id)}
                >
                  {!canVote ? 'فقط ساکنین می‌توانند رای دهند' : p.hasVoted ? 'قبلاً رای داده‌اید' : 'ثبت رای'}
                </button>
                {isAdmin && p.optionAudits?.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="text-sm font-semibold text-slate-700 mb-2">جزئیات آرا (فقط مدیریت)</div>
                    <div className="text-xs text-slate-500 mb-2">{p.optionAudits.reduce((sum, o) => sum + (o.votesCount || 0), 0)} رای ثبت شده</div>
                <div className="space-y-3">
                  {p.optionAudits.map((opt) => (
                    <div key={opt.optionId} className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-slate-800 text-sm">{opt.label}</div>
                        <span className="text-xs text-slate-600">{opt.votesCount || 0} رای</span>
                      </div>
                      {opt.voters?.length > 0 ? (
                       <ul className="mt-2 space-y-1 max-h-32 overflow-auto pr-1 text-sm">
                         {opt.voters.map((v, idx) => (
                           <li key={`${opt.optionId}-${v.user?._id || idx}`} className="flex justify-between gap-2">
                             <span className="text-slate-800">{v.user?.name || 'ناشناس'} <span className="text-[11px] text-slate-500">({v.user?.role || '-'})</span></span>
                             <span className="text-[11px] text-slate-500">{v.createdAt && new Date(v.createdAt).toLocaleString()}</span>
                           </li>
                         ))}
                       </ul>
                     ) : (
                       <div className="text-xs text-slate-500 mt-2">رای‌دهنده‌ای ثبت نشده</div>
                     )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ))}
      {polls.length === 0 && <p className="text-gray-500">رای‌گیری فعالی وجود ندارد.</p>}
    </div>
    </AppShell>
  );
}
