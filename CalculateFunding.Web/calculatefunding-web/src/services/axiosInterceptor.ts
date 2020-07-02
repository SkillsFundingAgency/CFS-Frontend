import axios from "axios";
import { LoginService } from '../auth/authProvider';
import { Config } from '../types/Config';
const configurationPromise:Promise<Config> = (window as any)['configuration'];

export function initialiseAxios() {
  configurationPromise.then(response => {
    let configuration = response;
    let loginService:LoginService | null;

    if (configuration.handlerEnabled)
    {
      loginService = new LoginService(configuration.baseUrl);       
    }
                        
    axios.interceptors.request.use(async function (config) 
    {
      if (loginService) 
      {
        if (loginService.userTokenInfo)
        {
          if (!loginService.isTokenExpired(loginService.userTokenInfo.expires_on))
          {
            config.headers.Authorization = `Bearer ${loginService.userTokenInfo.access_token}`;
          }
          else
          {
            return loginService.refresh(configuration.loginType).then(() =>
            {
              if (loginService && loginService.userTokenInfo)
              {
                config.headers.Authorzation = `Bearer ${loginService.userTokenInfo.access_token}`;
              }

              return Promise.resolve(config);
            })
          }
        }
        else
        {
          return loginService.login(configuration.loginType).then(() => 
          {
            if (loginService && loginService.userTokenInfo)
            {
              config.headers.Authorzation = `Bearer ${loginService.userTokenInfo.access_token}`;
            }

            return Promise.resolve(config);
          });
        }
      }

      return config;
    }, 
    error => {
      // Do something with request error
      return Promise.reject(error);
    });
  });
} 