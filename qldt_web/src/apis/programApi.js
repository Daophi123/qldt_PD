import axiosClient from './axiosClient'

const unwrap = (response) => response.data.data

export const programApi = {
  getMyProgram: () => axiosClient.get('/programs/my').then(unwrap)
}
