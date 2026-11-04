import axiosClient from "./axiosClient";

const unwrap = (response) => response.data.data;

export const scheduleApi = {
  getSemesters: () => axiosClient.get('/academic/semesters').then(unwrap),
  getClassSchedule: (semesterCode) => axiosClient.get('/schedules/class', { params: { semesterCode } }).then(unwrap)
};