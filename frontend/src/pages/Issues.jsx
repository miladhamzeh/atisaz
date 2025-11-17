// src/pages/Issues.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const categories = ['opt1','opt2','opt3','opt4','opt5','opt6'];

export default function Issues() {
  const { user } = useAuth();
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('');
  const [category, setCategory] = useState(categories[0]); const [issues, setIssues] = useState([]);

  const fetchIssues = async () => {
    const res = await api.get('/issues');
    setIssues(res.data);
  };
  useEffect(() => { fetchIssues(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/issues', { unitId: user.unit, title, description: desc, category });
      setTitle(''); setDesc(''); await fetchIssues(); alert('Issue reported');
    } catch { alert('Failed to report issue'); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Report an Issue</h2>
        <div className="bg-white p-4 rounded shadow mb-6">
          <form onSubmit={submit} className="space-y-3">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
            <select value={category} onChange={e=>setCategory(e.target.value)} className="p-2 border rounded">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe the problem" className="w-full p-2 border rounded" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">My Issues</h3>
          <ul className="mt-3">
            {issues.length === 0 && <li className="text-gray-500">No issues</li>}
            {issues.map(i => (
              <li key={i._id} className="border-t py-2 flex justify-between">
                <div>
                  <div className="font-medium">{i.title} <span className="text-xs text-gray-500">({i.category})</span></div>
                  <div className="text-sm text-gray-500">{i.description}</div>
                </div>
                <div className="text-sm text-gray-500">{i.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
