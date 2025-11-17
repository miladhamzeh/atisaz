// src/pages/DataCorrection.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Header from '../components/Header';

export default function DataCorrection() {
  const [message, setMessage] = useState('');
  const [mine, setMine] = useState([]);

  const fetchMine = async () => {
    // secretary/admin will use separate views; users can see their own via default controller filtering when not passing role
    try { const res = await api.get('/data-corrections'); setMine(res.data); } catch {}
  };

  useEffect(() => { fetchMine(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/data-corrections', { message });
    setMessage(''); await fetchMine(); alert('Request submitted');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Data Correction</h2>
        <div className="bg-white p-4 rounded shadow mb-6">
          <form onSubmit={submit} className="space-y-3">
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe what should be updated..." className="w-full p-2 border rounded" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Send Request</button>
          </form>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">My Requests</h3>
          <ul className="mt-3 space-y-2">
            {mine.map(r => (
              <li key={r._id} className="border-t pt-2">
                <div className="font-medium">{r.status}</div>
                <div className="text-sm text-gray-600">{r.message}</div>
              </li>
            ))}
            {mine.length === 0 && <li className="text-gray-500">No requests</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
