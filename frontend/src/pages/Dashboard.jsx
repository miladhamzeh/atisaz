// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchSummary = async () => {
      try {
        const res = await api.get("/users/summary");
        setSummary(res.data);
      } finally { setLoading(false); }
    };
    fetchSummary();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        {loading ? <p>Loading summary...</p> : (
          <div className="grid md:grid-cols-3 gap-6">
            <Tile to="/balance" title="Balance" desc="View charges & payments" />
            <Tile to="/moving" title="Moving" desc="Request move-in/out" />
            <Tile to="/issues" title="Issues" desc="Report facility issues" />
            <Tile to="/news" title="News" desc="Announcements & updates" />
            <Tile to="/voting" title="Voting & Polls" desc="Participate in community polls" />
            <Tile to="/data-correction" title="Data Correction" desc="Request info updates" />
            <Tile to="/renovation" title="Renovation" desc="Request renovation approval" />
            <Tile to="/tickets" title="Tickets & Messages" desc="Message staff by role" />
            <Tile to="/forum" title="Community Forum" desc="Discuss with residents" />
          </div>
        )}
        {summary && (
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Account Summary</h3>
            {'me' in summary ? (
              <>
                <p>Unpaid charges: {summary.unpaidCharges}</p>
                <p>Total payments: {summary.paymentsSum}</p>
              </>
            ) : (
              <>
                <p>Total users: {summary.totalUsers}</p>
                <p>Total units: {summary.totalUnits}</p>
                <p>Open tickets: {summary.openTickets}</p>
                <p>Unpaid charges: {summary.unpaidCharges}</p>
                <p>Total payments: {summary.totalPayments}</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Tile({ to, title, desc }) {
  return (
    <Link to={to} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p>{desc}</p>
    </Link>
  );
}
