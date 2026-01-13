// Frontend OAuth implementation with Vercel serverless functions
import { API_BASE_URL, GOOGLE_CLIENT_ID, REDIRECT_URI } from './config.js';

// Generate Google OAuth URL for ID token flow
export const getGoogleAuthUrl = async () => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID environment variable.');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'id_token token',
    scope: 'openid email profile',
    nonce: Date.now().toString()
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Capture token once when module loads (before React effects run twice)
let capturedToken = null;
if (window.location.hash.includes('id_token=')) {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  capturedToken = urlParams.get('id_token');
  window.history.replaceState(null, '', window.location.pathname);
}

// Handle Google OAuth callback - backend validation only
export const handleGoogleCallback = async () => {
  const idToken = capturedToken;
  capturedToken = null; // clear after use

  if (!idToken) {
    return { success: false };
  }

  try {

    // Validate ID token with backend
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Backend validation failed');
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user,
      sessionToken: data.sessionToken
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify user session (for protected routes)
export const verifyUserSession = async (userId) => {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.id === userId) {
        return {
          success: true,
          user
        };
      }
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
