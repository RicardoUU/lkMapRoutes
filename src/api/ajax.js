import axios from 'axios';
// import { getToken } from './auth';

const service = axios.create({
//   baseURL: process.env.BASE_HOST,
  timeout: 280000
});

// service.interceptors.request.use((config) => {
// //   let token = getToken();
// //   if (!token) {
// //     location.reload();
// //   }
// //   config.headers['Authorization'] = `Bearer ${token}`;
//   return config;
// }, (err) => {
//   console.log(err);
// });

export default service;