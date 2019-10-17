import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { UserManager, User, WebStorageStateStore, Log } from 'oidc-client';
import { Constants } from '../constants';
import { Utils } from './utils';
import { AuthContext } from '../model/auth-context';

@Injectable()
export class AuthService {
  
  /* we use this userManager mostly to talk to the IdentityServer4 and to manage the tokens  */
  private _userManager: UserManager;
  
  /* we access the goodies through this object */
  private _user: User;
  
  
  authContext: AuthContext;

  constructor(private httpClient: HttpClient) {
    Log.logger = console;
    
    var config = {
      
          authority: Constants.stsAuthority,    /* IdentityServer4 */
          client_id: Constants.clientId,        /* identifies the angular spa */

          /* Where do you want the IdentityServer4 to redirect back to you after you call the signinRedirect()  ******************* */
          redirect_uri: `${Constants.clientRoot}assets/oidc-login-redirect.html`,
          /* In this html file we harvest the goodies and they are saved in localStorage */

          /* Requested Scopes */
          scope: 'openid projects-api profile',

          /* Implicit flow */
          response_type: 'id_token token',

          /* Where do you want the IdentityServer4 to redirect back to you after you call the signoutRedirect()  ******************* */
          post_logout_redirect_uri: `${Constants.clientRoot}?postLogout=true`,

          /***** save the goodies in localStorage and not sessionStorage(default) *********** */
          userStore: new WebStorageStateStore({ store: window.localStorage }),

          automaticSilentRenew: true,
          silent_redirect_uri: `${Constants.clientRoot}assets/silent-redirect.html`
    };
    
    
    this._userManager = new UserManager(config);
    
    this._userManager.getUser().then(user => {
      if (user && !user.expired) {
        this._user = user;
        this.loadSecurityContext();
      }
    });
    this._userManager.events.addUserLoaded(args => {
      this._userManager.getUser().then(user => {
        this._user = user;
        this.loadSecurityContext();
      });
    });
  }

  login(): Promise<any> {
    return this._userManager.signinRedirect();
  }

  logout(): Promise<any> {
    return this._userManager.signoutRedirect();
  }

  isLoggedIn(): boolean {
    return this._user && this._user.access_token && !this._user.expired;
  }

  getAccessToken(): string {
    return this._user ? this._user.access_token : '';
  }

  signoutRedirectCallback(): Promise<any> {
    /* This cleans up the goodies from the storage ******************************/
    return this._userManager.signoutRedirectCallback();
  }

  loadSecurityContext() {
    this.httpClient.get<AuthContext>(`${Constants.apiRoot}Account/AuthContext`).subscribe(context => {
      this.authContext = context;
    }, error => console.error(Utils.formatError(error)));
  }
}
