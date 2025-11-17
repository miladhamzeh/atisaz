// src/features/payments/PaymentsPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

<h1>{t('home')}</h1>
<button onClick={() => i18n.changeLanguage('en')}>EN</button>
<button onClick={() => i18n.changeLanguage('fa')}>FA</button>

export default function PaymentsPage() {
  const user = useSelector(s => s.auth.user);
  const [charges, setCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedChargeIds, setSelectedChargeIds] = useState([]);

  const unitId = user?.unit;

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const q = unitId ? `?unitId=${unitId}` : '';
      const res = await api.get(`/charges${q}`);
      setCharges(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load charges');
    } finally { setLoading(false); }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments${unitId ? `?unitId=${unitId}` : ''}`);
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { if (unitId) { fetchCharges(); fetchPayments(); } }, [unitId]);

  const toggleCharge = (id) => {
    setSelectedChargeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!unitId) return alert('No unit assigned');
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return alert('Enter a valid amount');

    try {
      const payload = {
        unitId,
        amount,
        method: 'bank_transfer',
        appliedToChargeIds: selectedChargeIds
      };
      await api.post('/payments', payload);
      setPayAmount('');
      setSelectedChargeIds([]);
      await fetchCharges();
      await fetchPayments();
      alert('Payment recorded');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Payment failed');
    }
  };

  const totalDue = charges.reduce((s, c) => s + (c.paid ? 0 : c.amount), 0);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Payments & Balance</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold">Outstanding Charges</h3>
        {loading ? <p>Loading...</p> : (
          <table className="w-full mt-3">
            <thead><tr className="text-left text-sm text-gray-600"><th>Desc</th><th>Type</th><th>Amount</th><th>Due</th><th>Paid</th><th></th></tr></thead>
            <tbody>
              {charges.length === 0 && <tr><td colSpan="6" className="py-4 text-center text-gray-500">No charges</td></tr>}
              {charges.map(c => (
                <tr key={c._id} className="border-t">
                  <td className="py-2">{c.description}</td>
                  <td className="py-2">{c.type}</td>
                  <td className="py-2">{c.amount.toFixed(2)}</td>
                  <td className="py-2">{c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="py-2">{c.paid ? 'Yes' : 'No'}</td>
                  <td>
                    {!c.paid && (
                      <input type="checkbox" checked={selectedChargeIds.includes(c._id)} onChange={() => toggleCharge(c._id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-3 text-right">
          <span className="font-bold mr-4">Total Due: </span>
          <span className="text-red-600 font-semibold">{totalDue.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold">Make a Payment</h3>
        <form onSubmit={handlePay} className="mt-3 flex gap-3">
          <input className="p-2 border rounded w-48" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Amount" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Pay</button>
        </form>
        <p className="text-sm text-gray-500 mt-2">Tip: select charges above to allocate payment to them.</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Payment History</h3>
        <ul className="mt-3 space-y-2">
          {payments.length === 0 && <li className="text-gray-500">No payments yet</li>}
          {payments.map(p => (
            <li key={p._id} className="flex justify-between border-t py-2">
              <div>
                <div className="font-medium">{p.amount.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Method: {p.method || '—'}</div>
              </div>
              <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
