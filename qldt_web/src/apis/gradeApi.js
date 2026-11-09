import axiosClient from './axiosClient'

const unwrap = (response) => response.data.data

export const gradeApi = {
  getMyGrades: () => axiosClient.get('/grades/my').then(unwrap)
}
