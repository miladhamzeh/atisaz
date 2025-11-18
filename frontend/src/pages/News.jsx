// src/pages/News.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';



export default function News() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const canEdit = ['secretary', 'admin'].includes((user?.role || '').toLowerCase());

  const fetchNews = async () => {
    const res = await api.get('/news');
    setNews(res.data);
  };
  useEffect(() => { fetchNews(); }, []);

  const createNews = async (e) => {
    e.preventDefault();
    try {
      await api.post('/news', { title, body });
      setTitle(''); setBody('');
      await fetchNews();
    } catch (err) {
      alert(err.response?.data?.error || 'ثبت خبر ناموفق بود');
    }
  };

  const deleteNews = async (id) => {
    if (!window.confirm('حذف شود؟')) return;
    await api.delete(`/news/${id}`);
    await fetchNews();
  };

  return (
    <AppShell title="اخبار و اطلاعیه" subtitle="به‌روزترین اطلاعیه‌ها برای ساکنین">
     {canEdit && (
       <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5 mb-6">
         <h3 className="text-lg font-semibold text-slate-800 mb-2">ایجاد خبر جدید</h3>
         <form onSubmit={createNews} className="space-y-3">
           <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg" placeholder="عنوان" />
           <textarea value={body} onChange={e=>setBody(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg" placeholder="متن خبر" />
           <button className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold">انتشار خبر</button>
         </form>
       </div>
     )}

     <div className="space-y-4">
       {news.map(n => (
         <article key={n._id} className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl shadow p-5">
           <div className="flex items-start justify-between gap-3">
             <div>
               <h3 className="text-lg font-semibold text-slate-800">{n.title}</h3>
               <p className="text-sm text-gray-500">{n.author?.name || 'سیستم'} — {new Date(n.createdAt).toLocaleString()}</p>
             </div>
             {canEdit && <button onClick={() => deleteNews(n._id)} className="text-red-600 text-sm">حذف</button>}
           </div>
           <p className="mt-2 text-slate-700 leading-7">{n.body}</p>
           {n.images?.length > 0 && (
             <div className="flex gap-2 mt-3 flex-wrap">
               {n.images.map((img, i) => <img key={i} src={img} alt="" className="w-32 h-24 object-cover rounded" />)}
             </div>
           )}
         </article>
       ))}
       {news.length === 0 && <p className="text-gray-500">هیچ خبری ثبت نشده است.</p>}
     </div>
     </AppShell>
  );
}
