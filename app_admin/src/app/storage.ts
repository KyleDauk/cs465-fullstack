import { InjectionToken } from '@angular/core';

// The JWT comes back in the response body rather than a cookie, so the browser
// will not manage it for us. That rules out cookies (and incidentally removes
// the XSRF attack surface) and leaves the Local Storage API, which keeps the
// token available to the app across page loads. The trade-off is exposure to
// XSS, since any script running on the page can read local storage.
//
// Injecting storage behind a token rather than touching localStorage directly
// means a component never hard-codes the storage mechanism.
export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});

// NOTE: the guide also emits `export class Storage {}` here because
// `ng generate class storage` creates one. That name collides with the DOM's
// own Storage interface, which is the type this token is declared against,
// so it is deliberately left out.
