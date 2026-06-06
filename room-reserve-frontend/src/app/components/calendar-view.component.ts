import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.css'
})
export class CalendarViewComponent implements OnInit {
  bookings: any[] = [];
  viewDate = new Date();
  today = new Date();
  viewMode: 'day' | 'week' | 'month' = 'month';
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private bookingSvc: BookingService) {}
  ngOnInit() { this.load(); window.addEventListener('bookingsChanged', () => this.load()); }

  get dateInput() { return this.viewDate.toISOString().slice(0, 10); }
  get monthCells() {
    const first = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const gridStart = new Date(first);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return { date, outside: date.getMonth() !== this.viewDate.getMonth() };
    });
  }
  get weekDays() {
    const start = new Date(this.viewDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0,0,0,0);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }
  get visibleBookings() {
    return this.bookings
      .filter(b => this.inView(b.startTime))
      .filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED')
      .sort((a, b) => +a.startTime - +b.startTime);
  }

  load() {
    this.bookingSvc.list().subscribe(b => {
      this.bookings = (b || []).map(item => ({ ...item, startTime: item.startTime ? new Date(item.startTime) : null, endTime: item.endTime ? new Date(item.endTime) : null }));
    });
  }
  prev() { this.viewDate = this.viewMode === 'month' ? this.shiftMonth(-1) : this.shift(this.viewMode === 'day' ? -1 : -7); }
  next() { this.viewDate = this.viewMode === 'month' ? this.shiftMonth(1) : this.shift(this.viewMode === 'day' ? 1 : 7); }
  pickDate(event: Event) { this.viewDate = new Date((event.target as HTMLInputElement).value + 'T00:00:00'); }
  shift(days: number) { const d = new Date(this.viewDate); d.setDate(d.getDate() + days); return d; }
  shiftMonth(months: number) { const d = new Date(this.viewDate); d.setMonth(d.getMonth() + months); return d; }
  inView(date: Date | null) {
    if (!date) return false;
    const start = new Date(this.viewDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    if (this.viewMode === 'month') {
      start.setDate(1);
      end.setFullYear(start.getFullYear(), start.getMonth() + 1, 1);
    } else {
      end.setDate(end.getDate() + (this.viewMode === 'day' ? 1 : 7));
    }
    return date >= start && date < end;
  }
  sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }
  bookingsOn(date: Date) {
    return this.bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED' && b.startTime && this.sameDay(b.startTime, date));
  }
}
