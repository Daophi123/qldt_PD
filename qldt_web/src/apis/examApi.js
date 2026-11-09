import axiosClient from './axiosClient'

const unwrap = (response) => response.data.data

export const examApi = {
  getMySchedule: (semesterCode) => axiosClient.get('/exams', { params: { semesterCode } }).then(unwrap)
}
