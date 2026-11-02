import axiosClient from './axiosClient'

const unwrap = (response) => response.data.data;

export const newsApi = {
  getList: (params) => axiosClient.get('/news', { params }).then(unwrap),
  getDetail: (id) => axiosClient.get(`/news/${id}`).then(unwrap),
  getCategories: () => axiosClient.get('/news/categories').then(unwrap),
  getDepartments: () => axiosClient.get('/news/departments').then(unwrap),
  addComment: (id, content) => axiosClient.post(`/news/${id}/comments`, { content }).then(unwrap),
  getBookmarks: () => axiosClient.get('/news/bookmarks').then(unwrap),
  checkBookmark: (id) => axiosClient.get(`/news/${id}/bookmarks/check`).then(unwrap).then(data => data.isBookmarked),
  addBookmark: (id) => axiosClient.post(`/news/${id}/bookmarks`).then(unwrap),
  removeBookmark: (id) => axiosClient.delete(`/news/${id}/bookmarks`).then(unwrap)
}