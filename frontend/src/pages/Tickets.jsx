// src/pages/Tickets.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Header from '../components/Header';

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Tickets & Messages</h2>
        <div className="bg-white p-4 rounded shadow mb-6">
          <form onSubmit={create} className="flex gap-3 items-end">
            <input className="p-2 border rounded flex-1" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" />
            <select className="p-2 border rounded" value={assignedToRole} onChange={e=>setAssignedToRole(e.target.value)}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
          </form>
        </div>

        <div className="space-y-4">
          {tickets.map(t => (
            <div key={t._id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">
                {t.subject} <span className="text-xs text-gray-500">({t.status})</span>
              </div>
              <div className="text-sm text-gray-500">
                To: {t.assignedToUser?.name || t.assignedToRole || '—'}
              </div>
              <div className="mt-2 space-y-1">
                {t.messages.map((m,i) => (
                  <div key={i} className="text-sm">
                    <b>{m.sender?.name || m.role || 'User'}:</b> {m.message}{' '}
                    <span className="text-xs text-gray-500">({new Date(m.createdAt).toLocaleString()})</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    className="flex-1 p-2 border rounded"
                    value={reply[t._id] || ''}
                    onChange={e=>setReply(prev=>({ ...prev, [t._id]: e.target.value }))}
                    placeholder="Reply..."
                  />
                  <button className="bg-blue-600 text-white px-3 rounded" onClick={() => sendReply(t._id)}>Send</button>
                </div>
              </div>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-gray-500">No tickets</p>}
        </div>
      </div>
    </div>
  );
}
