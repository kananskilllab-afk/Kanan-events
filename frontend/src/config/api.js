// Central API base URL — reads from .env in dev, from Vercel env var in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default API_URL;
