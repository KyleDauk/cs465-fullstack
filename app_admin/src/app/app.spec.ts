import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { AuthenticationService } from './services/authentication.service';
import { fakeToken } from './testing/mock-trips';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the navigation bar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-navbar')).toBeTruthy();
  });

  it('offers Log In while nobody is authenticated', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const nav = fixture.nativeElement.textContent as string;
    expect(nav).toContain('Log In');
    expect(nav).not.toContain('Log Out');
  });

  it('switches the navigation bar to Log Out once a token is stored', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    // Angular 22 runs zoneless. The token lives in a signal inside
    // AuthenticationService, which is what makes this re-render at all.
    TestBed.inject(AuthenticationService).saveToken(fakeToken());
    await fixture.whenStable();

    const nav = fixture.nativeElement.textContent as string;
    expect(nav).toContain('Log Out');
    expect(nav).not.toContain('Log In');
  });
});
