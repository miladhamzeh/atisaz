// src/pages/Voting.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Header from '../components/Header';

export default function Voting() {
  const [polls, setPolls] = useState([]);
  const [selection, setSelection] = useState({});

  const fetchPolls = async () => { const res = await api.get('/polls'); setPolls(res.data); };
  useEffect(() => { fetchPolls(); }, []);

  const vote = async (pollId) => {
    const sel = selection[pollId];
    if (!sel) return alert('Please choose an option');
    await api.post(`/polls/${pollId}/vote`, { selectedOptionIds: sel });
    alert('Vote submitted'); await fetchPolls();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Voting & Polls</h2>
        <div className="space-y-4">
          {polls.map(p => (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{p.title} <span className="text-xs text-gray-500">({p.type})</span></h3>
              {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
              <div className="mt-3 space-y-1">
                {p.options.map(opt => (
                  <label key={opt._id} className="block">
                    <input
                      type={p.allowMultiple ? 'checkbox' : 'radio'}
                      name={`poll-${p._id}`}
                      onChange={e => {
                        setSelection(prev => {
                          if (p.allowMultiple) {
                            const arr = new Set(prev[p._id] || []);
                            e.target.checked ? arr.add(opt._id) : arr.delete(opt._id);
                            return { ...prev, [p._id]: Array.from(arr) };
                          }
                          return { ...prev, [p._id]: opt._id };
                        });
                      }}
                    />{' '}
                    {opt.label} {p.type === 'poll' && <span className="text-xs text-gray-500">— {opt.votesCount}</span>}
                  </label>
                ))}
              </div>
              <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded" onClick={() => vote(p._id)}>Submit</button>
            </div>
          ))}
          {polls.length === 0 && <p className="text-gray-500">No polls available.</p>}
        </div>
      </div>
    </div>
  );
}
