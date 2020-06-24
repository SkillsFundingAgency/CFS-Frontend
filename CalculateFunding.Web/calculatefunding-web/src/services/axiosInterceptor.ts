import axios from "axios";
import { authProvider } from '../auth/authProvider';
import { Config } from '../types/Config';
import { AuthenticationParameters } from "msal";
const configurationPromise:Promise<Config> = (window as any)['configuration'];

export function initialiseAxios() {
  configurationPromise.then(response => {
    let configuration = response;

    axios.interceptors.request.use(async function (config) {
        if (configuration.handlerEnabled) {
            const authParameters:AuthenticationParameters = { scopes:configuration.scopes };
            const token = await authProvider(configuration.clientId,
            configuration.tenantId,
            configuration.cacheLocation,
            configuration.scopes).getAccessToken(authParameters);
            config.headers.Authorization =  'Bearer ' + token.accessToken;
        }
        return config;
        }, function (error) {
        // Do something with request error
        return Promise.reject(error);
        });
  });
} 