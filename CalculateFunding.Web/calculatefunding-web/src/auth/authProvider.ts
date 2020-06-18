import { MsalAuthProvider, LoginType } from 'react-aad-msal';
import { CacheLocation } from 'msal';
const configuration = require('../setupConfig');

// Msal Configurations
const config = {
    auth: {
        authority: `https://login.windows.net/${configuration.tenantId}/`,
        clientId: configuration.clientId,
        validateAuthority: true
    },
    cache: {
        cacheLocation: configuration.cacheLocation as CacheLocation,
        storeAuthStateInCookie: true
    }
};

// Authentication Parameters
const authenticationParameters = {
    scopes: configuration.scopes
}

// Options
const options = {
    loginType: LoginType.Redirect
}

export const authProvider = new MsalAuthProvider(configuration, authenticationParameters, options)