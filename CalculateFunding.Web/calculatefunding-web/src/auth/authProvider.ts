import axios from "axios";
import { IdentityTokenInfo } from '../types/IdentityTokenInfo';
import { LoggerService } from '../services/loggerService'
var WindowsAzure = require('azure-mobile-apps-client');

export class LoginService { 
    private azureServiceClient: any;
    private baseUrl:string;
    private userIdentity: IdentityTokenInfo | null;
    private logger: LoggerService;

    private storageTokenKey: string = 'identity_token_info';

    constructor(baseUrl:string) {
        this.baseUrl = baseUrl;
        this.logger = new LoggerService();
        this.azureServiceClient = new WindowsAzure.MobileServiceClient(baseUrl);
        // Load userIdentity from local storage if it exists
        this.userIdentity = this.userTokenInfo;
    }

    public get userTokenInfo() : IdentityTokenInfo | null
    {
      let token: IdentityTokenInfo | null;

      if (this.userIdentity) 
      {
        // If its a valid token, just return it and move on.
        token = this.userIdentity;
      }
      else 
      {
        // Does this user's token reside in local storage?
        try
        {
          token = JSON.parse(localStorage.getItem(this.storageTokenKey) || '');
        }
        catch(e)
        {
          this.logger.debug(e);
          this.logout();             
          token = null;
        }
      }
      return token;
    }

    public isTokenExpired(expires_on:Date): boolean
    {
      let date:Date = new Date(expires_on);
      if (date === null)
      {
        return true;
      }
      return !(date.valueOf() > Date.now() );
    }

    refresh = (loginType: string): Promise<string> => {
      return new Promise((resolve, reject) => {
          if (this.userTokenInfo)
          {
            fetch(
                `${this.baseUrl}/.auth/refresh`, 
                {
                    method: 'GET',
                    headers: {
                        'X-ZUMO-AUTH': this.userTokenInfo.auth_token
                    }
                }
            )
            .then(response => {
              return response.json() as Promise<IdentityTokenInfo[]>;
            })
            .then(identitities => {
                this.userIdentity = identitities[0];

                // Write out userIdentity to local storage
                localStorage.setItem(this.storageTokenKey, JSON.stringify(this.userIdentity));

                resolve(this.userIdentity.user_id);
            })
            .catch(error => {
                this.clearAuth();
                // Fall back to login
                this.login(loginType).then((user:string) => {
                  resolve(user);
                })
                .catch(error => {
                  reject("Refresh failed.");
                });
            });
          }
          else
          {
            this.login(loginType).then((user:string) => {
              resolve(user);
            })
            .catch(error => {
              reject("Refresh failed.");
            });
          }
      });
    }

    public isLoggedIn(): boolean {
      let loggedIn: boolean = false;

      let userInfo: IdentityTokenInfo | null = this.userTokenInfo;

      if (userInfo) 
      {
        if (userInfo.user_id && userInfo.access_token && this.userIdentity != null && this.userIdentity.expires_on) 
        {
          if (this.isTokenExpired(this.userIdentity.expires_on))
          {
            // Expired token. Reset
            this.logout();
            loggedIn = false;
          }
          else
          {
              loggedIn = true;
          }
        }
      }

      this.logger.trace("<-- LoginService.isLoggedIn() [" + loggedIn + "]");

      return loggedIn;
    }

    public get loggedInUsername(): string | null {

      let username: string | null = null;

      if (this.userIdentity)
      {
        if (this.userIdentity.user_claims.length > 0)
        {
            // Alternative claims to consider:   
            // http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn
            // http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress
            //let name: string = this.userIdentity.user_claims.filter( claim => claim.typ === "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name" )[0].val; //DevSkim: ignore DS137138 

            let name: string = this.userIdentity.user_id;

            if (name)
            {
                username = name;
            }
        }
        else
        {
            this.logger.debug("No claims found");
        }
      }
      else
      {
        this.logger.debug( "No identity found.");
      }

      return username;
    }

    login = (loginType: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        switch (loginType.toLowerCase()) {
          case 'aad':
          case 'microsoftaccount':
            this.azureServiceClient.login(loginType).done(
                (results: { userId: string | PromiseLike<string> | undefined; }) => {
                resolve(results.userId);

                fetch(
                    `${this.baseUrl}/.auth/me`, 
                    {
                        method: 'GET',
                        headers: {
                            'X-ZUMO-AUTH': this.azureServiceClient.currentUser.mobileServiceAuthenticationToken
                        }
                    }
                )
                .then(response => {
                  return response.json() as Promise<IdentityTokenInfo[]>
                })
                .then(identities => {
                    this.userIdentity = identities[0];

                    // Set the auth token here so we can refresh the token if required
                    this.userIdentity.auth_token = this.azureServiceClient.currentUser.mobileServiceAuthenticationToken;
                    
                     // Write out userIdentity to local storage
                     localStorage.setItem( this.storageTokenKey, JSON.stringify(this.userIdentity));
                })
                .catch(error => {
                    this.clearAuth();
                });

            }, 
            (err: string) => {
                this.logger.error('Error: ' + err);
                reject("Login failed");
                localStorage.removeItem(this.storageTokenKey);
            });
            break;
          default:
            this.logger.error('Error: not implemented login request: ' + loginType);
            reject("Unknown login method");
            break;
        }
      });
    }

    private clearAuth(): void {
      this.userIdentity = null;
      localStorage.removeItem(this.storageTokenKey);
    }

    public logout(): any {
      this.logger.trace("--> LoginService.logout()");
      this.clearAuth();
      this.azureServiceClient.logout();
      this.logger.trace("<-- LoginService.logout()");
      return true;
    }
}