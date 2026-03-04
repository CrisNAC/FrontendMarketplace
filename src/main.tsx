import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "bootstrap/dist/css/bootstrap.min.css"; // NO TOCAR (KISSER SE LE VA CAER EL PELO)
import './index.css';
import App from './App.tsx';
// import axios from 'axios';

// axios.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         if (error.response.status === 401) {
//             const location = error.response.headers.location;
//             window.location = location;
//         }
//         return Promise.reject(error);
//     }
// );

// Todas las requests mandan la cookie automáticamente
//axios.defaults.withCredentials = true;

// Interceptor global — cualquier 401 en cualquier request manda al login
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       const location = error.response.headers.location;
//       window.location = location ?? "/login";
//     }
//     return Promise.reject(error);
//   }
// );

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

