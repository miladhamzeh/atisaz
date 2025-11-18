// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

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

  const inputClass =
"w-full border border-white/40 bg-white/90 text-right text-slate-800 placeholder:text-slate-400 rounded-xl pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-indigo-400 shadow-sm";

  return (
    <AuthLayout title="ورود به سامانه" subtitle="برای مدیریت امور شهرک وارد حساب کاربری خود شوید.">
       <motion.form
         onSubmit={submit}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4, ease: "easeOut" }}
         className="space-y-5"
       >
         <div className="space-y-1">
           <h2 className="text-2xl font-semibold text-slate-900">خوش آمدید</h2>
           <p className="text-sm text-slate-500">اطلاعات کاربری خود را وارد کنید تا وارد سامانه شوید.</p>
         </div>
         {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

         <label className="relative block text-right">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
             <Mail size={18} />
           </span>
           <input
             type="email"
             className={inputClass}
             placeholder="ایمیل"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             autoComplete="email"
           />
         </label>

         <label className="relative block text-right">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
             <Lock size={18} />
           </span>
           <input
             type="password"
             className={inputClass}
             placeholder="رمز عبور"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
             autoComplete="current-password"
           />
         </label>

         <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:from-indigo-500 hover:to-purple-500 transition">
           ورود به حساب
         </button>

         <p className="text-sm text-center text-slate-500">
           حساب کاربری ندارید؟{" "}
           <Link to="/register" className="text-indigo-600 font-semibold">
             ثبت‌نام کنید
           </Link>
         </p>
       </motion.form>
     </AuthLayout>
  );
}
