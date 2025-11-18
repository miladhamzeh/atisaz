// src/pages/Tickets.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AppShell from '../components/AppShell';

const roles = ['admin','secretary','accountant','facilities','lobbyman','security'];

export default function Tickets() {
  const [subject, setSubject] = useState('');
  const [assignedToRole, setAssignedToRole] = useState('secretary');
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState({});

  const fetchTickets = async () => { const res = await api.get('/tickets'); setTickets(res.data); };
  useEffect(() => { fetchTickets(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/tickets', { subject, assignedToRole });
    setSubject(''); await fetchTickets();
  };

  const sendReply = async (id) => {
    const msg = reply[id];
    if (!msg) return;
    await api.post(`/tickets/${id}/message`, { message: msg });
    setReply(prev => ({ ...prev, [id]: '' }));
    await fetchTickets();
  };
  const unitLabel = (u) => u?.number ? `واحد ${u.number}` : 'واحد نامشخص';

  return (
    <AppShell title="تیکت و پیام" subtitle="ارتباط مستقیم با منشی، حسابدار، فنی و نگهبانی">
       <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5 mb-6">
         <form onSubmit={create} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
           <input className="p-3 border rounded-lg border-slate-200 flex-1" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="موضوع پیام" />
           <select className="p-3 border rounded-lg border-slate-200" value={assignedToRole} onChange={e=>setAssignedToRole(e.target.value)}>
             {roles.map(r => <option key={r} value={r}>{r}</option>)}
           </select>
           <button className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold">ارسال</button>
         </form>
       </div>
       <div className="space-y-4">
     {tickets.map(t => (
       <div key={t._id} className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
         <div className="font-semibold text-slate-800">
           {t.subject} <span className="text-xs text-gray-500">({t.status})</span>
         </div>
         <div className="text-sm text-gray-600 flex flex-wrap gap-3 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                ارسال‌کننده: <strong>{t.createdBy?.name || '—'}</strong>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                {unitLabel(t.createdBy?.unit || t.unit)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                گیرنده: {t.assignedToUser?.name || t.assignedToRole || '—'}
              </span>
         </div>
         <div className="mt-2 space-y-2">
           {t.messages.map((m,i) => (
             <div key={i} className="text-sm bg-slate-50 border border-slate-100 rounded-lg p-2">
             <div className="flex flex-wrap gap-2 items-center mb-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{m.sender?.name || m.role || 'User'}</span>
                  <span className="px-2 py-0.5 bg-slate-200 rounded-full">{unitLabel(m.sender?.unit || t.unit)}</span>
                  <span className="text-gray-500">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <div>{m.message}</div>
             </div>
           ))}
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 p-3 border rounded-lg border-slate-200"
            value={reply[t._id] || ''}
            onChange={e=>setReply(prev=>({ ...prev, [t._id]: e.target.value }))}
            placeholder="پاسخ..."
          />
          <button className="bg-indigo-600 text-white px-4 rounded-lg" onClick={() => sendReply(t._id)}>ارسال</button>
        </div>
      </div>
      </div>
        ))}
        {tickets.length === 0 && <p className="text-gray-500">تیکتی وجود ندارد.</p>}
      </div>
      </AppShell>
  );
}
