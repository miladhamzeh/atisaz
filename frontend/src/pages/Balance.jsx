// src/pages/Balance.jsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import { CheckCircle2, Clock, CreditCard, Split, Wallet } from 'lucide-react';

const formatCurrency = (value) => Number(value || 0).toLocaleString('fa-IR');

export default function Balance() {
  const { user } = useAuth();
  const [charges, setCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedChargeIds, setSelectedChargeIds] = useState([]);
  const [payingId, setPayingId] = useState(null);

  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [chargeForm, setChargeForm] = useState({ description: '', amount: '', type: 'جاری', dueDate: '' });
  const [bulkFile, setBulkFile] = useState(null);
  const role = (user?.role || '').toLowerCase();
 const isUser = role === 'user';
 const isAdmin = role === 'admin';
 const isAccountant = role === 'accountant';
 const isSecretary = role === 'secretary';

 const unitId = isUser ? user?.unit : selectedUnitId;
 const canPay = isUser || isAccountant || isAdmin;
 const canApplyCharges = isAccountant || isAdmin;

 const needUnitSelection = !isUser && !unitId;

  const formatCurrency = (value) => Number(value || 0).toLocaleString('fa-IR');

  const fetchUnits = async () => {
    if (!(isSecretary || isAccountant || isAdmin)) return;
    const res = await api.get('/units');
    setUnits(res.data);
    if (!selectedUnitId && res.data.length > 0) setSelectedUnitId(res.data[0]._id);
  };
  const fetchCharges = async () => {
    setLoading(true);
    try {
      if (!unitId) return;
      const q = unitId ? `?unitId=${unitId}` : '';
      const res = await api.get(`/charges${q}`);
      setCharges(res.data);
    } finally { setLoading(false); }
  };




  const fetchPayments = async () => {
    if (!unitId) return;
    const res = await api.get(`/payments${unitId ? `?unitId=${unitId}` : ''}`);
    setPayments(res.data);
  };
  useEffect(() => { fetchUnits(); }, []);
  useEffect(() => { if (unitId) { fetchCharges(); fetchPayments(); } }, [unitId]);

  const toggleCharge = (id) => setSelectedChargeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!unitId) return alert('No unit assigned');
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return alert('Enter a valid amount');
    await api.post('/payments', { unitId, amount, method: 'bank_transfer', appliedToChargeIds: selectedChargeIds });
    setPayAmount(''); setSelectedChargeIds([]);
    await fetchCharges(); await fetchPayments();
    alert('Payment recorded');
  };

  const handleCreateCharge = async (e) => {
    e.preventDefault();
    if (!canApplyCharges) return;
    if (!unitId) return alert('واحد را انتخاب کنید');
    if (!chargeForm.amount || Number(chargeForm.amount) <= 0) return alert('مبلغ معتبر وارد کنید');
    await api.post('/charges', {
      unitId,
      description: chargeForm.description || 'شارژ جدید',
      amount: Number(chargeForm.amount),
      type: chargeForm.type,
      dueDate: chargeForm.dueDate || undefined,
    });
    setChargeForm({ description: '', amount: '', type: 'جاری', dueDate: '' });
    await fetchCharges();
    alert('شارژ ثبت شد');
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!canApplyCharges || !bulkFile) return;
    const fd = new FormData();
    fd.append('file', bulkFile);
    await api.post('/charges/bulk/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    alert('فایل دریافت شد؛ پس از اعمال، شارژها اضافه می‌شوند.');
    setBulkFile(null);
  };


  const handlePayCharge = async (charge) => {
    if (!unitId) return alert('No unit assigned');
    setPayingId(charge._id);
    try {
      await api.post('/payments', {
        unitId,
        amount: charge.amount,
        method: 'quickpay',
        appliedToChargeIds: [charge._id],
      });
      await fetchCharges();
      await fetchPayments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create payment');
    } finally {
      setPayingId(null);
    }
  };

  const normalizedBuckets = useMemo(() => {
    const buckets = { current: [], capital: [], other: [] };
    charges.forEach((c) => {
      const value = (c.type || '').toLowerCase();
      if (['جاری', 'current', 'operational', 'regular_maintenance'].includes(value)) buckets.current.push(c);
      else if (['عمرانی', 'capital', 'construction', 'capital_reserve'].includes(value)) buckets.capital.push(c);
      else buckets.other.push(c);
    });
    return buckets;
  }, [charges]);

  const totalDue = charges.reduce((s, c) => s + (c.paid ? 0 : c.amount), 0);
  const currentDue = normalizedBuckets.current.reduce((s, c) => s + (c.paid ? 0 : c.amount), 0);
  const capitalDue = normalizedBuckets.capital.reduce((s, c) => s + (c.paid ? 0 : c.amount), 0);

  return (
    <AppShell
      title="کیف پول و شارژها"
      subtitle="مدیریت پرداخت و شارژهای مجتمع"
      actions={(
        <div className="flex flex-wrap gap-3">
          <SummaryPill icon={<Wallet className="h-4 w-4" />} label="جمع بدهی" value={formatCurrency(totalDue)} accent="from-rose-500 to-orange-500" />
          <SummaryPill icon={<CreditCard className="h-4 w-4" />} label="جاری" value={formatCurrency(currentDue)} accent="from-blue-500 to-indigo-500" />
          <SummaryPill icon={<Split className="h-4 w-4" />} label="عمرانی" value={formatCurrency(capitalDue)} accent="from-emerald-500 to-teal-500" />
        </div>
      )}
    >
    <div className="space-y-4">
        {(isSecretary || isAccountant || isAdmin) && (
          <div className="bg-white/70 backdrop-blur border border-slate-100 rounded-2xl shadow p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm text-slate-600 mb-1">انتخاب واحد</label>
              <select value={selectedUnitId} onChange={e => setSelectedUnitId(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg">
                {units.map(u => <option key={u._id} value={u._id}>{u.number}</option>)}
              </select>
            </div>
            <div className="text-xs text-slate-500">برای مشاهده بدهی/پرداخت ابتدا واحد را انتخاب کنید.</div>
          </div>
        )}
        {needUnitSelection ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">ابتدا یک واحد را انتخاب کنید.</div>
        ) : (
          <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
            <div className="space-y-6">
                   <ChargeBucket
                   title="شارژ جاری"
                    caption="برای هزینههای روزمره و خدمات عمومی"
                    color="bg-blue-50"
                    charges={normalizedBuckets.current}
                     loading={loading}
                     onToggle={toggleCharge}
                     selected={selectedChargeIds}
                     onQuickPay={handlePayCharge}
                     payingId={payingId}
                     readOnly={!canPay || isSecretary}
                     />
                     <ChargeBucket
               title="شارژ عمرانی"
               caption="برای پروژه‌های عمرانی و توسعه‌ای"
               color="bg-emerald-50"
               charges={normalizedBuckets.capital}
               loading={loading}
               onToggle={toggleCharge}
               selected={selectedChargeIds}
               onQuickPay={handlePayCharge}
               payingId={payingId}
               readOnly={!canPay || isSecretary}
             />
             {normalizedBuckets.other.length > 0 && (
               <ChargeBucket
                 title="سایر موارد"
                 caption="مواردی که دسته مشخصی ندارند"
                 color="bg-slate-50"
                 charges={normalizedBuckets.other}
                 loading={loading}
                 onToggle={toggleCharge}
                 selected={selectedChargeIds}
                 onQuickPay={handlePayCharge}
                 payingId={payingId}
                 readOnly={!canPay || isSecretary}
               />
             )}
           </div>
           <div className="space-y-6">
              {canPay && (
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 border border-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center"><CreditCard size={20} /></div>
                    <div>
                      <h3 className="font-semibold text-slate-800">پرداخت شخصی‌سازی شده</h3>
                      <p className="text-sm text-slate-500">برای تسویه چند مورد به صورت یکجا</p>
                    </div>
                  </div>
                  <form onSubmit={handlePay} className="mt-4 space-y-3">
                    <input className="p-3 border border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-200" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="مبلغ دلخواه (تومان)" />
                    <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">پرداخت و ثبت</button>
                  </form>
                  <p className="text-xs text-slate-400 mt-2">مبلغ پرداخت شده به ترتیب انتخاب شما روی آیتم‌های تیک‌خورده اعمال می‌شود.</p>
                </div>
              )}

           {canApplyCharges && (
             <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 border border-emerald-50">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center"><Wallet size={20} /></div>
                 <div>
                 <h3 className="font-semibold text-slate-800">ثبت شارژ دستی</h3>
                     <p className="text-sm text-slate-500">جاری، عمرانی یا سایر هزینه‌ها</p>
                   </div>
                 </div>
                 <form onSubmit={handleCreateCharge} className="space-y-3">
                   <input value={chargeForm.description} onChange={e=>setChargeForm(prev=>({...prev, description:e.target.value}))} className="p-3 border border-slate-200 rounded-lg w-full" placeholder="توضیحات (مثلاً شارژ اضافی اسباب‌کشی)" />
                   <div className="grid grid-cols-2 gap-3">
                     <input type="number" value={chargeForm.amount} onChange={e=>setChargeForm(prev=>({...prev, amount:e.target.value}))} className="p-3 border border-slate-200 rounded-lg w-full" placeholder="مبلغ (تومان)" />
                     <select value={chargeForm.type} onChange={e=>setChargeForm(prev=>({...prev, type:e.target.value}))} className="p-3 border border-slate-200 rounded-lg w-full">
                       <option value="جاری">شارژ جاری</option>
                       <option value="عمرانی">شارژ عمرانی</option>
                       <option value="other">سایر</option>
                     </select>
                   </div>
                   <input type="date" value={chargeForm.dueDate} onChange={e=>setChargeForm(prev=>({...prev, dueDate:e.target.value}))} className="p-3 border border-slate-200 rounded-lg w-full" />
                   <button className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold">ثبت شارژ</button>
                 </form>
                 <form onSubmit={handleBulkUpload} className="mt-4 p-3 border border-dashed border-slate-200 rounded-xl space-y-2">
                   <label className="text-sm text-slate-600">بارگذاری اکسل بدهی‌ها</label>
                   <input type="file" accept=".xls,.xlsx" onChange={e=>setBulkFile(e.target.files?.[0] || null)} />
                   <button type="submit" className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm">ارسال فایل</button>
                 </form>
               </div>
             )}

             <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 border border-slate-100">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center"><CheckCircle2 size={20} /></div>
                 <div>
                   <h3 className="font-semibold text-slate-800">تاریخچه پرداخت‌ها</h3>
                   <p className="text-sm text-slate-500">نمایش کامل تراکنش‌های شما</p>
                 </div>
               </div>
               <ul className="mt-3 space-y-3 max-h-[420px] overflow-auto pr-1">
                 {payments.length === 0 && <li className="text-gray-500">No payments yet</li>}
                 {payments.map(p => (
                   <li key={p._id} className="p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 flex justify-between">
                     <div>
                       <div className="font-semibold text-slate-800">{formatCurrency(p.amount)} تومان</div>
                       <div className="text-xs text-slate-500">روش: {p.method || '—'}</div>
                       {p.unit?.number && <div className="text-[11px] text-slate-500">واحد {p.unit.number}</div>}
                     </div>
                     <div className="text-xs text-slate-500 text-right">{new Date(p.createdAt).toLocaleString()}</div>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         </div>
       )}
       </div>
    </AppShell>
  );
}

function ChargeBucket({ title, caption, charges, loading, onToggle, selected, color, onQuickPay, payingId, readOnly }) {
  return (
    <div className={`rounded-2xl shadow-lg border border-slate-100 ${color} p-5`}>
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-600">{caption}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><Clock size={14} /> آخرین وضعیت بدهی</div>
      </div>
      {loading ? <p className="mt-3 text-slate-500">در حال بارگذاری...</p> : (
        <div className="mt-4 space-y-3">
          {charges.length === 0 && <p className="text-slate-500">موردی ثبت نشده است.</p>}
          {charges.map((c) => (
            <div key={c._id} className="bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-slate-800">{c.description}</div>
                <div className="text-xs text-slate-500">سررسید: {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '—'}</div>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="text-lg font-bold text-slate-800">{formatCurrency(c.amount)} تومان</div>
                {!readOnly && (
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={selected.includes(c._id)} onChange={() => onToggle(c._id)} className="h-4 w-4" />
                    افزودن به پرداخت تجمیعی
                  </label>
                )}
                {!c.paid && !readOnly && (
                  <button onClick={() => onQuickPay(c)} disabled={payingId === c._id} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                    {payingId === c._id ? 'در حال پرداخت...' : 'پرداخت جداگانه'}
                  </button>
                )}
                {c.paid && <span className="text-emerald-600 text-sm font-semibold">پرداخت شده</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryPill({ icon, label, value, accent }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${accent} text-white shadow`}>
      <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center">{icon}</div>
      <div>
        <p className="text-xs opacity-90">{label}</p>
        <p className="text-lg font-bold">{value} تومان</p>
      </div>
    </div>
  );
}
