// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock, Home } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    unitNumber: "", // ✅ شمارهٔ واحد
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "user",
        unitNumber: form.unitNumber?.trim(), // ✅ به بک‌اند می‌فرستیم
      });

      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };
  const inputClass =
"w-full border border-white/40 bg-white/90 text-right text-slate-800 placeholder:text-slate-400 rounded-xl pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-indigo-400 shadow-sm";

const renderInput = (name, placeholder, type = "text", Icon) => (
  <label className="relative block text-right" key={name}>
      <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
      <Icon size={18} />
    </span>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={form[name]}
      onChange={handleChange}
      className={inputClass}
      required={name !== "unitNumber"}
      autoComplete={name}
    />
  </label>
);


  return (
    <AuthLayout title="ثبت‌نام در سامانه" subtitle="حساب کاربری خود را بسازید تا به خدمات آتیساز دسترسی داشته باشید.">
     <motion.form
       onSubmit={handleSubmit}
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.45, ease: "easeOut" }}
       className="space-y-5"
     >
       <div className="space-y-1">
         <h2 className="text-2xl font-semibold text-slate-900">ایجاد حساب جدید</h2>
         <p className="text-sm text-slate-500">اطلاعات خود را وارد کنید تا در شهرک ثبت‌نام شوید.</p>
       </div>

       {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

       <div className="space-y-3">
         {renderInput("name", "نام و نام خانوادگی", "text", User)}
         {renderInput("email", "ایمیل", "email", Mail)}
         {renderInput("password", "رمز عبور", "password", Lock)}
         {renderInput("confirmPassword", "تکرار رمز عبور", "password", Lock)}
         {renderInput("unitNumber", "شماره یا نام واحد (مثلاً A-101)", "text", Home)}
       </div>

       <button
         type="submit"
         className="w-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:via-indigo-600 transition"
       >
         ثبت‌نام و ورود
        </button>
        <p className="text-sm text-center text-slate-500">
        قبلاً حساب ساخته‌اید؟{" "}
        <Link to="/login" className="text-indigo-600 font-semibold">
          وارد شوید
        </Link>
      </p>
    </motion.form>
   </AuthLayout>
  );
};

export default Register;
