// API Utility
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_BASE_URL = isLocalhost 
  ? 'http://127.0.0.1:3000/api' 
  : 'https://complaints-registration-platform-full-tqz9.onrender.com/api';
async function apiFetch(endpoint, options = {}) {
  const url = `${BACKEND_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions = {
    ...options,
    headers,
    // Crucial for sending/receiving cookies (JWT) across origins
    credentials: 'init', // It will be overridden below, using 'include'
  };

  fetchOptions.credentials = 'include';

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Session management
async function checkSession() {
  try {
    const user = await apiFetch('/auth/me');
    return user;
  } catch (error) {
    return null;
  }
}

async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.className = 'alert error';
  }
}

function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.className = 'alert success';
  }
}
