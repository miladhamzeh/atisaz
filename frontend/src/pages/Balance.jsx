// src/pages/Balance.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function Balance() {
  const { user } = useAuth();
  const [charges, setCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedChargeIds, setSelectedChargeIds] = useState([]);

  const unitId = user?.unit;

  const fetchCharges = async () => {
    setLoading(true);
    try {
      const q = unitId ? `?unitId=${unitId}` : '';
      const res = await api.get(`/charges${q}`);
      setCharges(res.data);
    } finally { setLoading(false); }
  };

  const fetchPayments = async () => {
    const res = await api.get(`/payments${unitId ? `?unitId=${unitId}` : ''}`);
    setPayments(res.data);
  };

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

  const totalDue = charges.reduce((s, c) => s + (c.paid ? 0 : c.amount), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Payments & Balance</h2>
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
                    <td>{!c.paid && <input type="checkbox" checked={selectedChargeIds.includes(c._id)} onChange={() => toggleCharge(c._id)} />}</td>
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
    </div>
  );
}
