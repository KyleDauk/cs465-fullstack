import { Inject, Injectable, signal } from '@angular/core';

import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from './trip-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // Setup our storage and service access
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) {
    // Pick up a token left over from a previous session so a page refresh
    // does not silently log the user out.
    this.token.set(this.readToken());
  }

  // Variable to handle Authentication Responses
  authResp: AuthResponse = new AuthResponse();

  // Angular 22 runs zoneless. A plain property written inside an HTTP
  // callback does not tell the framework anything changed, so the navbar
  // would keep showing "Log In" after a successful login and the Add/Edit
  // buttons would stay hidden. Holding the token in a signal means every
  // template that calls isLoggedIn() re-renders the moment it is written.
  private token = signal<string>('');

  // NOTE: for this application we have decided that we will name the key
  // for our token 'travlr-token'
  private readToken(): string {
    let out: any;
    try {
      out = this.storage.getItem('travlr-token');
    } catch {
      out = null;     // private browsing can throw on storage access
    }
    if (!out) {
      return '';
    }
    return out;
  }

  // Get our token from our Storage provider.
  public getToken(): string {
    return this.token();
  }

  // Save our token to our Storage provider.
  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
    this.token.set(token);
  }

  // Logout of our application and remove the JWT from Storage
  public logout(): void {
    this.storage.removeItem('travlr-token');
    this.token.set('');
  }

  // Boolean to determine if we are logged in and the token is still valid.
  // Even if we have a token we will still have to reauthenticate if it has
  // expired, so the exp claim is checked rather than just the presence of
  // a token.
  public isLoggedIn(): boolean {
    const token: string = this.token();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > (Date.now() / 1000);
      } catch {
        return false;   // malformed token is not a logged-in user
      }
    }
    return false;
  }

  // Retrieve the current user. Only call this after checking isLoggedIn(),
  // otherwise there is no payload to read and this throws.
  public getCurrentUser(): User {
    const token: string = this.getToken();
    const { email, name } = JSON.parse(atob(token.split('.')[1]));
    return { email, name } as User;
  }

  // Login method that leverages the login method in tripDataService.
  // That method returns an Observable, so we subscribe and only act once
  // the response actually arrives.
  public login(user: User, passwd: string): void {
    this.tripDataService.login(user, passwd)
      .subscribe({
        next: (value: any) => {
          if (value) {
            console.log(value);
            this.authResp = value;
            this.saveToken(this.authResp.token);
          }
        },
        error: (error: any) => {
          console.log('Error: ' + error);
        }
      });
  }

  // Register method. Nearly identical to login because the API logs a new
  // user in immediately upon registration and hands back the same JWT.
  public register(user: User, passwd: string): void {
    this.tripDataService.register(user, passwd)
      .subscribe({
        next: (value: any) => {
          if (value) {
            console.log(value);
            this.authResp = value;
            this.saveToken(this.authResp.token);
          }
        },
        error: (error: any) => {
          console.log('Error: ' + error);
        }
      });
  }
}
