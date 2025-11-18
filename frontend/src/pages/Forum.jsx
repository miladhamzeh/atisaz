// src/pages/Forum.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AppShell from '../components/AppShell';

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');

  const fetchPosts = async () => { const res = await api.get('/forum'); setPosts(res.data); };
  useEffect(() => { fetchPosts(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/forum', { title, body });
    setTitle(''); setBody(''); await fetchPosts();
  };

  const comment = async (id, msg) => {
    if (!msg) return;
    await api.post(`/forum/${id}/comment`, { message: msg });
    await fetchPosts();
  };

  return (
    <AppShell title="فروم ساکنین" subtitle="گفتگو و تبادل نظر بین همسایه‌ها">
      <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5 mb-6">
        <form onSubmit={create} className="space-y-3">
          <input className="w-full p-3 border rounded-lg border-slate-200" placeholder="عنوان (اختیاری)" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full p-3 border rounded-lg border-slate-200" placeholder="پیام خود را بنویسید" value={body} onChange={e=>setBody(e.target.value)} />
          <button className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold">ارسال</button>
        </form>
      </div>
      <div className="space-y-4">
       {posts.map(p => (
         <div key={p._id} className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
           <div className="font-semibold text-slate-800">{p.title || 'بدون عنوان'}</div>
           <div className="text-sm text-gray-500">{p.author?.name} — {new Date(p.createdAt).toLocaleString()}</div>
           <p className="mt-2 text-slate-700">{p.body}</p>
           <div className="mt-3">
             <b>نظرات</b>
             <div className="space-y-1 mt-1">
               {p.comments.map((c,i)=>(
                 <div key={i} className="text-sm bg-slate-50 border border-slate-100 rounded-lg p-2"><b>{c.author?.name || 'User'}:</b> {c.message}</div>
               ))}
             </div>
             <CommentBox onSend={(msg)=>comment(p._id, msg)} />
           </div>
           </div>
       ))}
       {posts.length === 0 && <p className="text-gray-500">پستی وجود ندارد.</p>}
       </div>
    </AppShell>
  );
}

function CommentBox({ onSend }) {
  const [msg, setMsg] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input className="flex-1 p-2 border rounded" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Add a comment..." />
      <button className="bg-blue-600 text-white px-3 rounded" onClick={()=>{ onSend(msg); setMsg(''); }}>Send</button>
    </div>
  )
}
