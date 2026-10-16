// Vercel: VITE_API_URL must be set in production. In dev fall back to localhost.
// Strip trailing slash to avoid //api double slash
const raw = (import.meta.env.VITE_API_URL || '').trim() || 'http://localhost:5000';
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn('VITE_API_URL is not set — falling back to http://localhost:5000, API calls will fail in production.');
}
export const API_URL = raw.replace(/\/$/, '');
