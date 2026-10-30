import axiosClient, { refreshAccessToken } from './axiosClient';

const unwrap = response => response.data.data;

export const authApi = {
  login: payload => axiosClient.post('/auth/login', payload).then(unwrap),
  refresh: () => refreshAccessToken(),
  getMe: () => axiosClient.get('/auth/me').then(unwrap),
  logout: () => axiosClient.post('/auth/logout').then(unwrap),
  changePassword: payload => axiosClient.put('/auth/password', payload).then(unwrap)
}