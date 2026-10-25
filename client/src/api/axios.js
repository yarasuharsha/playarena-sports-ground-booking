import axios from 'axios';

const isProduction = import.meta.env.PROD;
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (isProduction && !configuredBaseUrl) {
  console.error(
    '❌ Configuration Error: VITE_API_BASE_URL is not configured. ' +
    'Please set VITE_API_BASE_URL to your backend URL (e.g., https://your-backend.onrender.com/api/v1) ' +
    'in your Vercel project environment variables and redeploy.'
  );
}

const api = axios.create({
  baseURL: configuredBaseUrl || (isProduction ? '' : '/api/v1'),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor to attach JWT token and guard against missing base URL in production
api.interceptors.request.use(
  (config) => {
    if (isProduction && !configuredBaseUrl) {
      return Promise.reject({
        status: 0,
        code: 'MISSING_API_CONFIG',
        message: 'API base URL is not configured. Please set VITE_API_BASE_URL in Vercel settings and redeploy.',
        details: null
      });
    }

    const token = localStorage.getItem('playarena_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors, non-JSON HTML payloads, and format messages
api.interceptors.response.use(
  (response) => {
    // Detect non-JSON (HTML) response bodies (e.g. from misconfigured rewrites or 404 pages)
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
      return Promise.reject({
        status: response.status || 500,
        code: 'HTML_RESPONSE_MISCONFIGURATION',
        message: 'Server configuration error: Received HTML page instead of API JSON. Please check VITE_API_BASE_URL configuration.',
        details: null
      });
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('playarena_token');
        localStorage.removeItem('playarena_user');
      }
    }

    const status = error.response?.status ?? 0;
    const responseData = error.response?.data;

    let message;
    if (typeof responseData === 'string' && responseData.trim().startsWith('<!DOCTYPE')) {
      message = 'Server configuration error: Backend returned an HTML page instead of JSON. Check VITE_API_BASE_URL.';
    } else if (status === 401) {
      message = 'Invalid email or password';
    } else if (
      status === 0 ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout')
    ) {
      message = 'Cannot reach the server, please try again';
    } else if (status >= 500) {
      message = 'Server error, please try again later';
    } else {
      message = responseData?.error?.message || error.message || 'Something went wrong';
    }

    const customError = {
      status,
      code: responseData?.error?.code || (status === 0 ? 'NETWORK_ERROR' : 'API_ERROR'),
      message,
      details: responseData?.error?.details || null
    };

    return Promise.reject(customError);
  }
);

export default api;
