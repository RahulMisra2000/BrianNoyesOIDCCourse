import { Component, OnInit } from '@angular/core';
import { AccountService } from './core/account.service';
import { UserProfile } from './model/user-profile';
import { MatDialog } from '@angular/material';
import { Utils } from './core/utils';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  userProfile: UserProfile;
  firstLogin = false;
  constructor(
    private _acctService: AccountService,
    public dialog: MatDialog,
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit() {
    /* WE COME HERE under two scenarios : The user starts the application OR IdentityServer4 redirects here AFTER 
       the user logs out because in the configuration we provided the root of Angular app as the post-logout redirect URI
    */
    
    /***** Not the best way to read query params but anyway Brian did this .. */
    /*** if this is true that means based on how we have configured, that we have just been redirected here by IdentityServer4 
         after the user logged out
         so, we should call the signoutRedirectCallback() method which deletes the goodies that was saved in storage
         To see the entire flow, see what happens when the user clicks the logout button and then see the configuration that
         has the postlogoutredirect uri specified to be the root of the angular app, which means this component.
    */
    if (window.location.href.indexOf('?postLogout=true') > 0) {
      this._authService.signoutRedirectCallback().then(() => {
        let url: string = this._router.url.substring(
          0,
          this._router.url.indexOf('?')
        );
        this._router.navigateByUrl(url);
      });
    }
  }

  login() {
    this._authService.login();
  }

  logout() {
    this._authService.logout();
  }

  isLoggedIn() {
    return this._authService.isLoggedIn();
  }

  isAdmin() {
    return this._authService.authContext && this._authService.authContext.claims && (this._authService.authContext.claims.find(c => c.type === 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role' && c.value === 'Admin'));
  }
}
