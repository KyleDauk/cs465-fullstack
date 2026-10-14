import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { TripDataService } from './trip-data.service';
import { Trip } from '../models/trip';
import { User } from '../models/user';
import { MOCK_TRIPS } from '../testing/mock-trips';

describe('TripDataService', () => {
  let service: TripDataService;
  let http: HttpTestingController;
  const base = 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TripDataService);
    http = TestBed.inject(HttpTestingController);
  });

  // Fails the test if the service made a call the spec did not account for.
  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTrips issues GET /api/trips and returns the trips', () => {
    let result: Trip[] | undefined;
    service.getTrips().subscribe(t => result = t);

    const req = http.expectOne(`${base}/trips`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_TRIPS);

    expect(result?.length).toBe(2);
    expect(result?.[0].name).toBe('Gale Reef');
    expect(result?.[1].code).toBe('DAWR210228');
  });

  it('getTrip issues GET /api/trips/:code for a single trip', () => {
    let result: Trip[] | undefined;
    service.getTrip('GALR210214').subscribe(t => result = t);

    const req = http.expectOne(`${base}/trips/GALR210214`);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_TRIPS[0]]);

    expect(result?.[0].resort).toBe('Emerald Bay, 3 stars');
  });

  it('addTrip POSTs the whole trip document to /api/trips', () => {
    service.addTrip(MOCK_TRIPS[0]).subscribe();

    const req = http.expectOne(`${base}/trips`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.code).toBe('GALR210214');
    expect(req.request.body.perPerson).toBe('799.00');
    req.flush(MOCK_TRIPS[0]);
  });

  it('updateTrip PUTs to the URL carrying the trip code', () => {
    const edited = { ...MOCK_TRIPS[0], name: 'Gale Reef Deluxe' };
    service.updateTrip(edited).subscribe();

    const req = http.expectOne(`${base}/trips/GALR210214`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.name).toBe('Gale Reef Deluxe');
    req.flush(edited);
  });

  it('deleteTrip DELETEs the URL carrying the trip code', () => {
    service.deleteTrip('GALR210214').subscribe();

    const req = http.expectOne(`${base}/trips/GALR210214`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('login POSTs name, email and password to /api/login', () => {
    const user = { name: 'Tester', email: 'tester@example.com' } as User;
    service.login(user, 'secret').subscribe();

    const req = http.expectOne(`${base}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Tester', email: 'tester@example.com', password: 'secret'
    });
    req.flush({ token: 'a.b.c' });
  });

  it('register POSTs to /api/register and returns the token', () => {
    const user = { name: 'Tester', email: 'tester@example.com' } as User;
    let token: string | undefined;
    service.register(user, 'secret').subscribe(r => token = r.token);

    const req = http.expectOne(`${base}/register`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'x.y.z' });

    expect(token).toBe('x.y.z');
  });

  it('surfaces a server error to the caller rather than swallowing it', () => {
    let status: number | undefined;
    service.getTrips().subscribe({
      next: () => {},
      error: e => status = e.status
    });

    http.expectOne(`${base}/trips`)
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
  });
});
