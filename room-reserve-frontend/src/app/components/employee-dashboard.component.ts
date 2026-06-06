import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertBannerComponent } from './alert-banner.component';
import { BookingService } from '../services/booking.service';
import { RoomService } from '../services/room.service';
import { ResourceService } from '../services/resource.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AlertBannerComponent],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  username = sessionStorage.getItem('username') || 'there';
  greeting = 'Welcome back';
  liveTime = '';
  liveDate = '';
  
  get displayName(): string {
    const val = sessionStorage.getItem('name') || this.username || '';
    if (!val || val === 'there') return 'there';
    let name = val.includes('@') ? val.split('@')[0] : val;
    name = name.replace(/[._-]/g, ' ');
    return name.replace(/\b\w/g, c => c.toUpperCase());
  }
  
  totalRooms = 0;
  totalResources = 0;
  myBookingsToday = 0;
  activeSlideIndex = 0;
  slides = [
    {
      icon: '🏢',
      title: 'Smart Workspace Reservation',
      description: 'Find and reserve state-of-the-art conference rooms, pods, and creative studio layouts in just 3 clicks. Smart conflict checks prevent duplicate or overlapping bookings.',
      badge: 'space booking'
    },
    {
      icon: '🔌',
      title: 'Seamless Resource Allocation',
      description: 'Need a projector, microphones, whiteboards, or accessories? Add high-quality workspace amenities directly to your meeting rooms when booking.',
      badge: 'amenities'
    },
    {
      icon: '⚡',
      title: 'Real-Time Approval Workflows',
      description: 'Submit requests to approvers instantly. Receive real-time push notifications on bookings status changes, ensuring rapid workspace organization.',
      badge: 'approvals workflow'
    },
    {
      icon: '📊',
      title: 'Auditable Analytics & Compliance',
      description: 'Complete audit logs track check-ins, check-outs, cancellations, and settings updates, keeping your organization compliant and resource efficient.',
      badge: 'compliance'
    }
  ];

  private clockInterval: any;
  private carouselInterval: any;

  constructor(
    private bookingSvc: BookingService,
    private roomSvc: RoomService,
    private resourceSvc: ResourceService
  ) {}

  ngOnInit() {
    this.updateGreeting();
    this.updateClock();
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);

    // Auto-advance carousel every 6 seconds
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);

    // load counts
    this.roomSvc.list().subscribe(list => this.totalRooms = list?.length || 0);
    this.resourceSvc.list().subscribe(list => this.totalResources = list?.length || 0);

    const todayStr = new Date().toDateString();
    this.bookingSvc.list(undefined, this.username).subscribe(list => {
      this.myBookingsToday = list?.filter(b => {
        if (!b.startTime || b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
        return new Date(b.startTime).toDateString() === todayStr;
      }).length || 0;
    });
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide() {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.slides.length) % this.slides.length;
  }

  selectSlide(index: number) {
    this.activeSlideIndex = index;
    // Reset auto-rotate timer on manual click
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = setInterval(() => {
        this.nextSlide();
      }, 6000);
    }
  }

  private updateGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) this.greeting = 'Good morning';
    else if (hr < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  private updateClock() {
    const now = new Date();
    this.liveTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.liveDate = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }

  get greetingClass(): string {
    const hr = new Date().getHours();
    if (hr < 12) return 'morning-theme';
    if (hr < 17) return 'afternoon-theme';
    return 'evening-theme';
  }
}
