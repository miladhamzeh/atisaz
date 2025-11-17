// src/pages/Renovation.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

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
    setDescription(''); setDesiredStart(''); setDesiredEnd(''); await fetchList(); alert('Renovation request sent');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Renovation Requests</h2>
        <div className="bg-white p-4 rounded shadow mb-6">
          <form onSubmit={submit} className="space-y-3">
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe your renovation..." className="w-full p-2 border rounded" />
            <div className="flex gap-3">
              <div><label className="block text-sm">Start</label><input type="date" value={desiredStart} onChange={e=>setDesiredStart(e.target.value)} className="p-2 border rounded" /></div>
              <div><label className="block text-sm">End</label><input type="date" value={desiredEnd} onChange={e=>setDesiredEnd(e.target.value)} className="p-2 border rounded" /></div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
          </form>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">My Requests</h3>
          <ul className="mt-3 space-y-2">
            {list.map(r => (
              <li key={r._id} className="border-t pt-2">
                <div className="font-medium">{r.status}</div>
                <div className="text-sm text-gray-600">{r.description}</div>
              </li>
            ))}
            {list.length === 0 && <li className="text-gray-500">No requests</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
