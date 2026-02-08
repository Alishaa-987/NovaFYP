import axios from "axios";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
