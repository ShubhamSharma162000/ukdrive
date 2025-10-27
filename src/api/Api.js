// import { deleteItem, getItem } from '@/src/storage/storage';
import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const Api = axios.create({
  // baseURL: 'https://ukdrive-server.onrender.com/api',
  baseURL: 'https://wordier-granville-driftingly.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

Api.interceptors.request.use(
  async config => {
    // const token = await getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
        // const refreshToken = await getItem('refreshToken');

        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(
          'https://your-api-url.com/api/auth/refresh',
          {
            refreshToken,
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // await SecureStore.setItemAsync('accessToken', accessToken);
        // await SecureStore.setItemAsync('refreshToken', newRefreshToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return Api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Clear tokens on refresh failure
        // await deleteItem('accessToken');
        // await deleteItem('refreshToken');

        // Optional: Notify user & navigate to login screen
        // Example (depends on your navigation setup)
        // Alert.alert('Session expired', 'Please log in again.');
        // navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default Api;
