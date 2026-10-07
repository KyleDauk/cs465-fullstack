import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Trip } from '../models/trip';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-trip-card',
  imports: [CommonModule],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css'
})
export class TripCard implements OnInit {
  @Input('trip') trip: any;

  constructor(
    private router: Router,
    private tripDataService: TripDataService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
  }

  // Delegates to the AuthenticationService so the template can hide controls
  // that would fail against the now-protected API endpoints.
  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  public editTrip(trip: Trip): void {
    localStorage.removeItem('tripCode');
    localStorage.setItem('tripCode', trip.code);
    this.router.navigate(['edit-trip']);
  }

  public deleteTrip(trip: Trip): void {
    if (!confirm('Delete trip "' + trip.name + '"?')) {
      return;
    }
    this.tripDataService.deleteTrip(trip.code)
      .subscribe({
        next: () => {
          console.log('Deleted trip ' + trip.code);
          window.location.reload();
        },
        error: (error: any) => {
          console.log('Error: ' + error);
        }
      });
  }
}
