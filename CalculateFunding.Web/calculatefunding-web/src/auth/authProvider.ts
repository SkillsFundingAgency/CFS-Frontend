import { MsalAuthProvider, LoginType } from 'react-aad-msal';
import { CacheLocation } from 'msal';

export const authProvider = (clientId:string, tenantId:string, cacheLocation:CacheLocation, scopes:string[]) => {
    // Msal Configurations
    const config = {
        auth: {
            authority: `https://login.windows.net/${tenantId}/`,
            clientId: clientId,
            validateAuthority: true
        },
        cache: {
            cacheLocation: cacheLocation,
            storeAuthStateInCookie: true
        }
    };

    // Authentication Parameters
    const authenticationParameters = {
        scopes: scopes
    }

    // Options
    const options = {
        loginType: LoginType.Redirect
    }

    return new MsalAuthProvider(config, authenticationParameters, options);
}