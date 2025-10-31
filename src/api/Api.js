import axios from 'axios';
import * as Keychain from 'react-native-keychain';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const Api = axios.create({
  baseURL: 'https://wordier-granville-driftingly.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

Api.interceptors.request.use(
  async config => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.username === 'authTokens') {
        const tokens = JSON.parse(credentials.password);
        if (tokens.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
      }
    } catch (error) {
      console.warn('Error retrieving token from Keychain:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

Api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return Api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const credentials = await Keychain.getGenericPassword();
        if (!credentials || credentials.username !== 'authTokens')
          throw new Error('No refresh token available');

        const tokens = JSON.parse(credentials.password);
        const { refreshToken } = tokens;

        const response = await axios.post(
          'https://wordier-granville-driftingly.ngrok-free.dev/api/auth/refresh',
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await Keychain.setGenericPassword(
          'authTokens',
          JSON.stringify({ accessToken, refreshToken: newRefreshToken }),
        );

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return Api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await Keychain.resetGenericPassword();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default Api;
