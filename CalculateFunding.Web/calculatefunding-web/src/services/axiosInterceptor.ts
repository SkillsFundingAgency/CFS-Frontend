import axios from "axios";
import { authProvider } from '../auth/authProvider';
const configuration = require('../setupConfig');

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(async function (config) {
    if (configuration.handlerEnabled) {
        const token = await authProvider.getAccessToken();
        // Do something before request is sent
        config.headers.Authorization =  'Bearer ' + token.accessToken;
    }
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

export default axiosInstance;