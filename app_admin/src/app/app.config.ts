import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptProvider } from './utils/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // withInterceptorsFromDi() is what activates a class-based
    // HTTP_INTERCEPTORS provider; plain provideHttpClient() ignores it.
    //
    // The guide (p. 220) instead keeps provideHttpClient() and adds
    // importProvidersFrom(HttpClientModule). That was tested and it does
    // work, because HttpClientModule itself provides
    // provideHttpClient(withInterceptorsFromDi()) and, coming later in this
    // array, it wins. But HttpClientModule is deprecated in Angular 22 -
    // its own notice reads "use provideHttpClient(withInterceptorsFromDi())
    // as providers instead" - and the guide's form only works by accident of
    // provider ordering while configuring HttpClient twice. One explicit
    // call says the same thing without the deprecation or the duplication.
    provideHttpClient(withInterceptorsFromDi()),
    authInterceptProvider
  ]
};
