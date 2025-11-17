// src/features/auth/Register.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from './authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

<h1>{t('home')}</h1>
<button onClick={() => i18n.changeLanguage('en')}>EN</button>
<button onClick={() => i18n.changeLanguage('fa')}>FA</button>


export default function Register() {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(register({ name, email, password })).unwrap();
      navigate('/');
    } catch (err) {
      alert(err?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full p-2 border" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" />
        <input className="w-full p-2 border" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" className="w-full p-2 border" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="w-full bg-green-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}
