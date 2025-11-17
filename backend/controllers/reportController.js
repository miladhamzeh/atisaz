// controllers/reportController.js
const xlsx = require('xlsx');
const Charge = require('../models/Charge');
const Payment = require('../models/Payment');
const Unit = require('../models/Unit');

exports.debtsAndPaymentsXlsx = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateQuery = {};
    if (from || to) {
      dateQuery.createdAt = {};
      if (from) dateQuery.createdAt.$gte = new Date(from);
      if (to) dateQuery.createdAt.$lte = new Date(to);
    }

    const unpaid = await Charge.find({ paid: false }).populate('unit');
    const byUnit = {};
    for (const c of unpaid) {
      const u = c.unit?.number || 'Unknown';
      byUnit[u] = byUnit[u] || { unit: u, regular_maintenance: 0, capital_reserve: 0, other: 0, total: 0 };
      byUnit[u][c.type] += c.amount;
      byUnit[u].total += c.amount;
    }

    const payments = await Payment.find(dateQuery).populate('unit user');

    const wb = xlsx.utils.book_new();
    const debtsRows = Object.values(byUnit).sort((a,b)=>a.unit.localeCompare(b.unit));
    const debtsSheet = xlsx.utils.json_to_sheet(debtsRows.length ? debtsRows : [{ note: 'No unpaid charges' }]);
    xlsx.utils.book_append_sheet(wb, debtsSheet, 'Debts');

    const payRows = payments.map(p => ({
      date: p.createdAt,
      unit: p.unit?.number,
      user: p.user?.email,
      amount: p.amount,
      method: p.method,
      appliedCharges: (p.appliedTo || []).length
    }));
    const paysSheet = xlsx.utils.json_to_sheet(payRows.length ? payRows : [{ note: 'No payments' }]);
    xlsx.utils.book_append_sheet(wb, paysSheet, 'Payments');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="debts-payments.xlsx"`);
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to build report' });
  }
};
