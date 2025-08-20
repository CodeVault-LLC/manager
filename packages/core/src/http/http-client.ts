import axios from "axios";
import { net } from "electron";

const httpClient = axios.create({
  timeout: 10000,
  headers: {
    "User-Agent": "Manager Desktop App",
  },
});

httpClient.interceptors.request.use((config) => {
  if (!net.isOnline()) {
    return Promise.reject(new Error("No internet connection"));
  }

  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.headers["retry-after"]) {
      const delay = parseInt(err.response.headers["retry-after"], 10) * 1000;
      return new Promise((resolve) =>
        setTimeout(() => resolve(httpClient(err.config)), delay)
      );
    }
    return Promise.reject(err);
  }
);

export { httpClient };
