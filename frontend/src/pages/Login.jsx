// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth(); const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.error || "Invalid credentials"); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input type="email" className="w-full border rounded p-2 mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" className="w-full border rounded p-2 mb-3" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
        <p className="text-sm text-center mt-3">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
      </form>
    </div>
  );
}
