// src/pages/Renovation.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

export default function Renovation() {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [desiredStart, setDesiredStart] = useState('');
  const [desiredEnd, setDesiredEnd] = useState('');
  const [list, setList] = useState([]);

  const fetchList = async () => { const res = await api.get('/renovations'); setList(res.data); };
  useEffect(() => { fetchList(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/renovations', { unitId: user.unit, description, desiredStart, desiredEnd });
    setDescription(''); setDesiredStart(''); setDesiredEnd(''); await fetchList(); alert('درخواست بازسازی با موفقیت ارسال شد');
  };

  return (
    <AppShell title="بازسازی و تعمیرات" subtitle="هماهنگی بازسازی با مدیریت">
     <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6">
       <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
         <h3 className="text-lg font-semibold text-slate-800 mb-2">جزئیات بازسازی</h3>
         <form onSubmit={submit} className="space-y-3">
         <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="توضیح دهید چه تغییراتی نیاز دارید" className="w-full p-3 border rounded-lg border-slate-200" />
           <div className="grid sm:grid-cols-2 gap-3">
             <div>
               <label className="block text-sm text-slate-600 mb-1">شروع</label>
               <input type="date" value={desiredStart} onChange={e=>setDesiredStart(e.target.value)} className="p-3 border rounded-lg border-slate-200 w-full" />
             </div>
             <div>
               <label className="block text-sm text-slate-600 mb-1">پایان</label>
               <input type="date" value={desiredEnd} onChange={e=>setDesiredEnd(e.target.value)} className="p-3 border rounded-lg border-slate-200 w-full" />
             </div>
           </div>
           <button className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold">ارسال</button>
         </form>
       </div>

        <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">درخواست‌های من</h3>
          <ul className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {list.map(r => (
              <li key={r._id} className="p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50">
               <div className="font-semibold text-slate-800">{r.status}</div>
               <div className="text-sm text-slate-600 mt-1">{r.description}</div>
             </li>
           ))}
           {list.length === 0 && <li className="text-gray-500">درخواستی ثبت نشده است.</li>}
       </ul>
     </div>
     </div>
    </AppShell>
  );
}
