// src/pages/Forum.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Header from '../components/Header';

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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Community Forum</h2>
        <div className="bg-white p-4 rounded shadow mb-6">
          <form onSubmit={create} className="space-y-3">
            <input className="w-full p-2 border rounded" placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full p-2 border rounded" placeholder="Share something..." value={body} onChange={e=>setBody(e.target.value)} />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
          </form>
        </div>

        <div className="space-y-4">
          {posts.map(p => (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">{p.title || 'Untitled'}</div>
              <div className="text-sm text-gray-500">by {p.author?.name} — {new Date(p.createdAt).toLocaleString()}</div>
              <p className="mt-2">{p.body}</p>
              <div className="mt-3">
                <b>Comments</b>
                <div className="space-y-1 mt-1">
                  {p.comments.map((c,i)=>(
                    <div key={i} className="text-sm"><b>{c.author?.name || 'User'}:</b> {c.message}</div>
                  ))}
                </div>
                <CommentBox onSend={(msg)=>comment(p._id, msg)} />
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-gray-500">No posts</p>}
        </div>
      </div>
    </div>
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
