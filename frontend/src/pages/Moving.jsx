// src/pages/Moving.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Moving() {
  const { user } = useAuth();
  const [type, setType] = useState('move_in');
  const [scheduledDate, setScheduledDate] = useState('');
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/moves');
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
      await api.post('/moves', { type, scheduledDate, reason }); // ⬅️ unitId نمی‌فرستیم
      setReason('');
      setScheduledDate('');
      await fetchRequests();
      alert('Move request submitted');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit move request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-semibold mb-4">Move Requests</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold">Request Move</h3>
        <form onSubmit={submit} className="mt-3 space-y-3">
          <div>
            <label className="block text-sm">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="p-2 border rounded">
              <option value="move_in">Move In</option>
              <option value="move_out">Move Out</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Scheduled date</label>
            <input type="date" value={scheduledDate} onChange={e=>setScheduledDate(e.target.value)} className="p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Reason</label>
            <textarea value={reason} onChange={e=>setReason(e.target.value)} className="p-2 border rounded w-full" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit Request</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">My Requests</h3>
        {loading ? <p>Loading...</p> : (
          <ul className="mt-3">
            {requests.length === 0 && <li className="text-gray-500">No requests</li>}
            {requests.map(r => (
              <li key={r._id} className="border-t py-2 flex justify-between">
                <div>
                  <div className="font-medium">
                    {r.type} — {r.status}{r.assessedDebt>0 ? ` (Debt: ${r.assessedDebt})` : ''}
                  </div>
                  <div className="text-sm text-gray-500">{r.reason}</div>
                </div>
                <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
