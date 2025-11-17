// src/pages/News.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Header from '../components/Header';

export default function News() {
  const [news, setNews] = useState([]);
  useEffect(() => { (async () => { const res = await api.get('/news'); setNews(res.data); })(); }, []);
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">News</h2>
        <div className="space-y-4">
          {news.map(n => (
            <article key={n._id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{n.title}</h3>
              <p className="text-sm text-gray-500">by {n.author?.name} — {new Date(n.createdAt).toLocaleString()}</p>
              <p className="mt-2">{n.body}</p>
              {n.images?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {n.images.map((img, i) => <img key={i} src={img} alt="" className="w-32 h-24 object-cover rounded" />)}
                </div>
              )}
            </article>
          ))}
          {news.length === 0 && <p className="text-gray-500">No announcements yet.</p>}
        </div>
      </div>
    </div>
  );
}
