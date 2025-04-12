// utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://repo.ldev.cloudi.city:11000",
  withCredentials: true,
});

export default api;