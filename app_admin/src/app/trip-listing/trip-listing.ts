import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TripCard } from '../trip-card/trip-card';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-listing',
  imports: [CommonModule, TripCard],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css',
  providers: [TripDataService]
})
export class TripListing implements OnInit {
  // Angular 22 runs without Zone.js, so plain properties assigned inside an
  // async callback do not trigger a re-render. Signals notify the framework
  // on write, which is what makes the listing update after the API responds.
  trips = signal<Trip[]>([]);
  message = signal<string>('');

  constructor(
    private tripDataService: TripDataService,
    private router: Router
  ) {
    console.log('trip-listing constructor');
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  private getStuff(): void {
    this.tripDataService.getTrips()
      .subscribe({
        next: (value: any) => {
          this.trips.set(value);
          if (value.length > 0) {
            this.message.set('There are ' + value.length + ' trips available.');
          } else {
            this.message.set('There were no trips retrieved from the database');
          }
          console.log(this.message());
        },
        error: (error: any) => {
          this.message.set('Error retrieving trips');
          console.log('Error: ' + error);
        }
      });
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.getStuff();
  }
}
