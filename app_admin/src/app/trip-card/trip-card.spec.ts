import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { TripCard } from './trip-card';
import { AuthenticationService } from '../services/authentication.service';
import { MOCK_TRIPS, fakeToken } from '../testing/mock-trips';

describe('TripCard', () => {
  let component: TripCard;
  let fixture: ComponentFixture<TripCard>;
  let auth: AuthenticationService;

  const text = () => fixture.nativeElement.textContent as string;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TripCard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // editTrip() navigates to 'edit-trip'. Declaring the route here
        // keeps that navigation from failing in the background and
        // reporting an unhandled rejection alongside the passing tests.
        provideRouter([{ path: 'edit-trip', children: [] }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripCard);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthenticationService);

    // The card renders from an @Input, so it must be supplied before the
    // first change detection or the template dereferences undefined.
    fixture.componentRef.setInput('trip', MOCK_TRIPS[0]);
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the trip name in the card header', () => {
    expect(text()).toContain('Gale Reef');
  });

  it('renders the resort and the length', () => {
    expect(text()).toContain('Emerald Bay, 3 stars');
    expect(text()).toContain('4 nights / 5 days');
  });

  it('renders the per-person price formatted as US currency', () => {
    // the template pipes perPerson through currency:'USD':'symbol'
    expect(text()).toContain('$799.00');
  });

  it('renders the description', () => {
    expect(text()).toContain('A dive trip on the outer reef.');
  });

  it('binds the image name onto the img src', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toContain('reef1.jpg');
  });

  it('hides the Edit and Delete controls when nobody is logged in', () => {
    expect(component.isLoggedIn()).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
  });

  it('shows the Edit and Delete controls once a valid token is stored', async () => {
    auth.saveToken(fakeToken());
    await fixture.whenStable();

    expect(component.isLoggedIn()).toBe(true);
    expect(text()).toContain('Edit Trip');
    expect(text()).toContain('Delete');
  });

  it('treats an expired token as logged out', async () => {
    auth.saveToken(fakeToken(-60));   // expired a minute ago
    await fixture.whenStable();

    expect(component.isLoggedIn()).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
  });

  it('stashes the trip code and navigates when Edit Trip is pressed', async () => {
    await component.editTrip(MOCK_TRIPS[0]);
    expect(localStorage.getItem('tripCode')).toBe('GALR210214');
  });
});
