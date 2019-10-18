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
    Log.logger = console;                         //*** This is great if you want to see logging messages from the oidc-client.js library
    
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
    
    /* When angular app starts get the goodies from the storage. We get it in user object ********* */
    this._userManager.getUser().then(user => {
      if (user && !user.expired) {
        this._user = user;
        this.loadSecurityContext();
      }
    });
    
    
    /**** Anytime the oidc-client.js gets hold of a set of tokens (either when you login or if an automatic silent renew happens)
          it raises the assUserLoaded event and we can provide an event handler which can take the new user object (it has all the 
          goodies) and place it in a property in our service (_user) so anyone interested can have access to the latest
          
          Other events raised that we can write event handlers for is listed in the docs here
          https://github.com/IdentityModel/oidc-client-js/wiki#events
    */
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

  /* **** Here basically we are calling an endpoint on our Resource Server (RS) and that endpoint returns all the claims that 
          it finds inside the AT, etc. 
          this info is then used by angular app to customize what can and cannot be seen in the UI and we also use that 
          information to build route guards
          
          I wonder why not just read the claims from the goodies since it is already in storage here in the browser. 
          Why go all the way to the Resource Server and get it from there. I sent Brian a question about this.
          Let's see what he says. Because a hacker can change the claims anyway in the developer console and customize the UI ...
          OF COURSE that has NO meaningful effect because the real authorization is happening on the Resource Server .. I get that !
  */
  loadSecurityContext() {
    this.httpClient.get<AuthContext>(`${Constants.apiRoot}Account/AuthContext`).subscribe(context => {
      this.authContext = context;
    }, error => console.error(Utils.formatError(error)));
  }
}
