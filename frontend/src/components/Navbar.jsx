// src/components/Navbar.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold text-lg">Atisaz</Link>
        <Link to="/payments" className="text-sm">Payments</Link>
        <Link to="/moves" className="text-sm">Moves</Link>
        <Link to="/issues" className="text-sm">Issues</Link>
        <Link to="/forum" className="text-sm">Forum</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user && <span className="text-sm text-gray-600">Hi, {user.name}</span>}
        <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      </div>
    </nav>
  );
}
