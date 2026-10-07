import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';

// Attaching the bearer token to every protected call by hand would mean
// editing trip-data.service every time the API grows. An interceptor lifts
// that cross-cutting concern out into one place in the HTTP pipeline.
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authenticationService: AuthenticationService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // The login and register calls must NOT carry a token - they are how you
    // get one in the first place.
    //
    // NOTE: the guide tests request.url.startsWith('login'), but request.url
    // is the absolute 'http://localhost:3000/api/login', so that test is
    // never true and a stale token gets attached to the auth calls. Matching
    // on the path is what the guide intended.
    const isAuthAPI: boolean =
      request.url.includes('/login') || request.url.includes('/register');

    if (this.authenticationService.isLoggedIn() && !isAuthAPI) {
      const token = this.authenticationService.getToken();

      // HttpRequest is immutable, so the request is cloned with the header
      // added rather than modified in place.
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    return next.handle(request);
  }
}

export const authInterceptProvider: Provider =
  {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true
  };
