import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { RoomService } from '../services/room.service';
import { ResourceService } from '../services/resource.service';

function toLocalDateString(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toLocalTimeString(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  rooms: any[] = [];
  resources: any[] = [];
  editing: any = null;
  selectedResourceIds = new Set<number>();
  fg = new FormGroup({
    roomId: new FormControl<number | null>(null, Validators.required),
    date: new FormControl('', Validators.required),
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
    description: new FormControl('')
  });

  constructor(private bookingSvc: BookingService, private roomSvc: RoomService, private resourceSvc: ResourceService) {}
  ngOnInit() {
    this.load();
    this.roomSvc.list().subscribe(r => this.rooms = r || []);
    this.resourceSvc.list().subscribe(r => this.resources = r || []);
    window.addEventListener('bookingsChanged', () => this.load());
  }

  load() {
    const username = sessionStorage.getItem('username') || undefined;
    this.bookingSvc.list(undefined, username).subscribe(b => this.bookings = (b || []).map(x => ({ ...x, startTime: x.startTime ? new Date(x.startTime) : null, endTime: x.endTime ? new Date(x.endTime) : null })));
  }
  select(b: any) { this.edit(b); }
  edit(b: any) {
    this.editing = b;
    this.selectedResourceIds = new Set((b.resources || []).map((r: any) => r.resourceId));
    this.fg.patchValue({
      roomId: b.roomId,
      date: toLocalDateString(b.startTime),
      start: toLocalTimeString(b.startTime),
      end: toLocalTimeString(b.endTime),
      title: b.title || '',
      description: b.description || ''
    });
  }
  save() {
    if (!this.editing || this.fg.invalid) return;
    const v = this.fg.value;
    const payload = {
      roomId: Number(v.roomId),
      startTime: new Date(v.date + 'T' + v.start).toISOString(),
      endTime: new Date(v.date + 'T' + v.end).toISOString(),
      title: v.title,
      description: v.description,
      createdBy: sessionStorage.getItem('username') || 'anonymous',
      resources: Array.from(this.selectedResourceIds).map(id => ({ resourceId: id, quantity: 1 }))
    };
    this.bookingSvc.update(this.editing.id, payload).subscribe(() => {
      this.editing = null;
      this.load();
      window.dispatchEvent(new Event('bookingsChanged'));
    });
  }
  cancel(b: any) {
    this.bookingSvc.cancel(b.id, 'Cancelled by requester').subscribe(() => {
      this.load();
      window.dispatchEvent(new Event('bookingsChanged'));
    });
  }
  toggleResource(resource: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedResourceIds.add(resource.id);
    else this.selectedResourceIds.delete(resource.id);
  }
  resourceSummary(b: any) { return (b.resources || []).map((r: any) => `${r.name} x${r.quantity || 1}`).join(', '); }
}
