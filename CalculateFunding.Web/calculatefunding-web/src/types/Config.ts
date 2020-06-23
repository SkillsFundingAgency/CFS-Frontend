import { CacheLocation } from "msal";

export interface Config {
    handlerEnabled: boolean;
    tenantId: string;
    clientId: string;
    cacheLocation: CacheLocation;
    scopes: string[];
};