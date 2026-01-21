// Frontend configuration

// API Configuration - point to backend dev server
export const API_BASE_URL = import.meta.env.VITE_API_ROOT_URL || `http://localhost:3001`;

// Warn if API URL looks misconfigured in production
if (import.meta.env.PROD && API_BASE_URL.includes('localhost')) {
  console.warn('[Config] API_BASE_URL points to localhost in production build. Set VITE_API_ROOT_URL before building.');
}
export const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || window.location.origin;

// Authentication Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const REDIRECT_URI = `${window.location.origin}/auth/callback`;
