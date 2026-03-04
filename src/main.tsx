import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "bootstrap/dist/css/bootstrap.min.css"; // NO TOCAR (KISSER SE LE VA CAER EL PELO)
import './index.css';
import App from './App.tsx';
// import axios from 'axios';

// axios.interceptors.response.use(
//     (response) => {
//         console.log("Response:", response.status, response.config.url);
//         return response;
//     },
//     (error) => {
//         if (error.response.status === 401) {
//             console.log("Error status:", error.response?.status);
//             console.log("Error data:", error.response?.data);
//             console.log("Error headers:", error.response?.headers);
//             console.log("error.response existe?:", !!error.response)
//             const location = error.response.headers.location;
//             window.location = location;
//         }
//         return Promise.reject(error);
//     }
// );

// Todas las requests mandan la cookie automáticamente
//axios.defaults.withCredentials = true;

// // Interceptor global — cualquier 401 en cualquier request manda al login
// axios.interceptors.response.use(
//   (response) => {
//     console.log("Response:", response.status, response.config.url);
//     return response;
//   },
//   (error) => {
//     console.log("Error status:", error.response?.status);
//     console.log("Error data:", error.response?.data);
//     console.log("Error headers:", error.response?.headers);
//     console.log("error.response existe?:", !!error.response)
//     if (error.response?.status === 401) {
//       console.log("🔁 Redirigiendo a /login...");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

