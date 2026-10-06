import { Routes } from '@angular/router';

import { AddTrip } from './add-trip/add-trip';
import { EditTrip } from './edit-trip/edit-trip';
import { TripListing } from './trip-listing/trip-listing';

export const routes: Routes = [
  { path: 'add-trip', component: AddTrip },
  { path: 'edit-trip', component: EditTrip },
  { path: '', component: TripListing, pathMatch: 'full' }
];
