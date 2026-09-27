// Centralized API Base configuration
// In local development, VITE_API_URL is empty and requests use Vite's proxy (/api)
// In production (Vercel), VITE_API_URL points to the deployed Render backend (e.g. https://your-backend.onrender.com)
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
