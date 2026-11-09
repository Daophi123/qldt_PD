import axiosClient from './axiosClient'

const unwrap = (response) => response.data.data

export const documentApi = {
  getList: (params) => axiosClient.get('/documents', { params }).then(unwrap)
}