// src/api/axios.js
import axios from "axios";

const API_URL = "http://localhost:5001/api";

const instance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ همیشه توکن را از localStorage ست کن تا "هدر درست لود نشده" رفع شود
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
