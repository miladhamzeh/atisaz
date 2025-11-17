// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Balance from "./pages/Balance";
import Moving from "./pages/Moving";
import Issues from "./pages/Issues";
import News from "./pages/News";
import Voting from "./pages/Voting";
import DataCorrection from "./pages/DataCorrection";
import Renovation from "./pages/Renovation";
import Tickets from "./pages/Tickets";
import Forum from "./pages/Forum";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/balance" element={<ProtectedRoute><Balance /></ProtectedRoute>} />
        <Route path="/moving" element={<ProtectedRoute><Moving /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
        <Route path="/voting" element={<ProtectedRoute><Voting /></ProtectedRoute>} />
        <Route path="/data-correction" element={<ProtectedRoute><DataCorrection /></ProtectedRoute>} />
        <Route path="/renovation" element={<ProtectedRoute><Renovation /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />

        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </Router>
  );
}
