// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react"; // optional icon

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
      >
        <Home size={18} />
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
