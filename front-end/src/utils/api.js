// Vercel: VITE_API_URL must be set in production. In dev fall back to localhost.
// Strip trailing slash to avoid //api double slash
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = raw.replace(/\/$/, '');
