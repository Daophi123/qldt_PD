import axios from 'axios';
import { clearToken, getToken, setToken } from '../utils/tokenStore';

const axiosClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const SKIP_REFRESH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout'];

let refreshPromise = null;
let onSessionExpired = null;

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

export function refreshAccessToken() {
  if(!refreshPromise) {
    refreshPromise = axiosClient
      .post('/auth/refresh')
      .then(res => {
        const { token } = res.data.data;
        setToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      })
  }
  return refreshPromise;
}

axiosClient.interceptors.request.use(config => {
  const token = getToken();
  if(token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

axiosClient.interceptors.response.use(response => response, async(error) => {
  const original = error.config;
  const isUnauthorized = error.response?.status === 401;
  const shouldSkip = !original || original._retry || SKIP_REFRESH_URLS.some(url => original.url?.includes(url))
  if(!isUnauthorized || shouldSkip) {
    return Promise.reject(error);
  }

  original._retry = true;
  try {
    const token = await refreshAccessToken();
    original.headers.Authorization = `Bearer ${token}`;
    return axiosClient(original);
  } catch(refreshError) {
    clearToken();
    onSessionExpired?.();
    return Promise.reject(refreshError);
  }
})

export default axiosClient;