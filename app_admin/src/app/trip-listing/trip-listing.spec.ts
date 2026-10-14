import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TripListing } from './trip-listing';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';
import { MOCK_TRIPS, fakeToken } from '../testing/mock-trips';

describe('TripListing', () => {
  let fixture: ComponentFixture<TripListing>;
  let component: TripListing;

  const text = () => fixture.nativeElement.textContent as string;

  // Stands in for the real service so the listing is tested against known
  // data rather than whatever the API happens to return.
  const stubService = {
    getTrips: () => of(MOCK_TRIPS),
    deleteTrip: () => of({})
  };

  async function build(service: any = stubService) {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TripListing],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .overrideComponent(TripListing, {
        set: { providers: [{ provide: TripDataService, useValue: service }] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(TripListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  afterEach(() => localStorage.clear());

  it('should create', async () => {
    await build();
    expect(component).toBeTruthy();
  });

  it('loads the trips from the service on init', async () => {
    await build();
    expect(component.trips().length).toBe(2);
    expect(component.trips()[0].name).toBe('Gale Reef');
  });

  it('renders one card per trip', async () => {
    await build();
    expect(fixture.nativeElement.querySelectorAll('app-trip-card').length).toBe(2);
  });

  it('renders the values from the mock trips', async () => {
    await build();
    expect(text()).toContain('Gale Reef');
    expect(text()).toContain("Dawson's Reef");
    expect(text()).toContain('Emerald Bay, 3 stars');
    expect(text()).toContain('$1,299.00');
  });

  it('reports how many trips were retrieved', async () => {
    await build();
    expect(component.message()).toBe('There are 2 trips available.');
  });

  it('reports an empty database rather than failing silently', async () => {
    await build({ getTrips: () => of([]) });
    expect(component.message()).toBe('There were no trips retrieved from the database');
  });

  it('reports an error when the service fails', async () => {
    await build({ getTrips: () => throwError(() => new Error('network down')) });
    expect(component.message()).toBe('Error retrieving trips');
  });

  it('hides Add Trip when nobody is logged in', async () => {
    await build();
    expect(text()).not.toContain('Add Trip');
  });

  it('shows Add Trip once a valid token is stored', async () => {
    await build();
    TestBed.inject(AuthenticationService).saveToken(fakeToken());
    await fixture.whenStable();
    expect(text()).toContain('Add Trip');
  });
});
