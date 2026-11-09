import axiosClient from './axiosClient'

const unwrap = (response) => response.data.data

export const registrationApi = {
  getOverview: (semesterCode) => axiosClient.get('/registrations', { params: { semesterCode } }).then(unwrap),
  getHistory: (semesterCode) => axiosClient.get('/registrations/history', { params: { semesterCode } }).then(unwrap),
  register: (classSectionId) => axiosClient.post('/registrations', { classSectionId }).then(unwrap),
  cancel: (enrollmentId) => axiosClient.delete(`/registrations/${enrollmentId}`).then(unwrap)
}
