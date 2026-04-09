import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

export const getCsrfCookie = async () => {
  await axios.get(`${import.meta.env.VITE_API_BASE}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });
};