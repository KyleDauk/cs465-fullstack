import { Trip } from '../models/trip';

// Mock trip data used across the component and service specs, so every test
// asserts against the same known values rather than whatever happens to be
// in the database at the time.
export const MOCK_TRIPS: Trip[] = [
  {
    _id: '000000000000000000000001',
    code: 'GALR210214',
    name: 'Gale Reef',
    length: '4 nights / 5 days',
    start: new Date('2026-02-14T00:00:00Z'),
    resort: 'Emerald Bay, 3 stars',
    perPerson: '799.00',
    image: 'reef1.jpg',
    description: 'A dive trip on the outer reef.'
  },
  {
    _id: '000000000000000000000002',
    code: 'DAWR210228',
    name: "Dawson's Reef",
    length: '5 nights / 6 days',
    start: new Date('2026-02-28T00:00:00Z'),
    resort: 'Castaway Cove, 4 stars',
    perPerson: '1299.00',
    image: 'reef2.jpg',
    description: 'Six days of guided diving.'
  }
];

// A structurally valid JWT whose exp claim is an hour in the future.
// AuthenticationService.isLoggedIn() only decodes the payload and compares
// exp, so this is enough to drive the logged-in branches in a unit test
// without involving the server.
export function fakeToken(expiresInSeconds = 3600): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    _id: '1',
    email: 'tester@example.com',
    name: 'Tester',
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  }));
  return `${header}.${payload}.not-a-real-signature`;
}
