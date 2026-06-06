import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyBookingsComponent } from './my-bookings.component';
import { CalendarViewComponent } from './calendar-view.component';
import { AlertBannerComponent } from './alert-banner.component';

@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [CommonModule, MyBookingsComponent, CalendarViewComponent, AlertBannerComponent],
  templateUrl: './my-bookings-page.component.html',
  styleUrl: './my-bookings-page.component.css'
})
export class MyBookingsPageComponent {}
