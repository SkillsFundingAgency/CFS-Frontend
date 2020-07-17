import axios from "axios";
import { Config } from '../types/Config';
const configurationPromise:Promise<Config> = (window as any)['configuration'];

export function initialiseAxios() {
  configurationPromise.then(response => {
    let configuration = response;

    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.interceptors.response.use(async function (config) 
    {
      return config;
    },
    error => {
      if (!configuration.handlerEnabled)
      {
        return Promise.reject(error);
      }

      const originalRequest = error.config;

      // no authentication provided so need to login
      if (error.response.status === 403)
      {
        window.location.href = `${configuration.baseUrl}/.auth/login/aad?post_login_redirect_url=${window.location.href}`;
      }

      // Do something with request error
      if (error.response.status === 401 && !originalRequest._retry) 
      {
        originalRequest._retry = true;
        fetch(
          `${configuration.baseUrl}/.auth/refresh`, 
          {
              method: 'GET'
          }
        )
        .then(response => {
          return response.json();
        })
        .then(() => {
            axios(originalRequest);
        })
        .catch(error => {
            // do login redirect
            window.location.href = `${configuration.baseUrl}/.auth/login/aad?post_login_redirect_url=${window.location.href}`;
        });
      }
      else
      {
        return Promise.reject(error);
      }
    });
  });
} 