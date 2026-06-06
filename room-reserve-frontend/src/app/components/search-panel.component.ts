import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { AlertService } from '../services/alert.service';
import { RoomService } from '../services/room.service';
import { FacilityService } from '../services/facility.service';
import { ResourceService } from '../services/resource.service';

function toLocalISOString(date: Date): string {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number) => String(num).padStart(2, '0');
  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    dif + pad(Math.floor(Math.abs(tzo) / 60)) +
    ':' + pad(Math.abs(tzo) % 60);
}

function getHoursString(offset = 0): string {
  const d = new Date();
  d.setHours(d.getHours() + offset);
  return String(d.getHours()).padStart(2, '0') + ':00';
}

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.css'
})
export class SearchPanelComponent {
  fg = new FormGroup({
    date: new FormControl(new Date().toISOString().slice(0, 10), Validators.required),
    start: new FormControl(getHoursString(0), Validators.required),
    end: new FormControl(getHoursString(1), Validators.required),
    capacity: new FormControl(1, Validators.required),
    equipment: new FormControl(''),
    title: new FormControl('Team meeting', Validators.required),
    description: new FormControl('')
  });

  bookingFg = new FormGroup({
    date: new FormControl('', Validators.required),
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
    title: new FormControl('Team meeting', Validators.required),
    description: new FormControl(''),
    capacity: new FormControl(1, Validators.required)
  });

  rooms: any[] = [];
  resources: any[] = [];
  selectedResourceIds = new Set<number>();
  equipmentOptions: string[] = [];
  filtered: any[] = [];
  searched = false;
  page = 0;
  pageSize = 6; // cards layout looks better in multiples of 2 or 3
  facility: any;
  selectedRoom: any = null;

  constructor(private bookingSvc: BookingService, private alert: AlertService, private roomSvc: RoomService, private facilitySvc: FacilityService, private resourceSvc: ResourceService) {
    this.roomSvc.list().subscribe(r => { this.rooms = r || []; this.collectEquipment(); });
    this.resourceSvc.list().subscribe(r => this.resources = (r || []).filter(x => x.active !== false));
    this.facilitySvc.get().subscribe(f => this.facility = f);
    this.search(); // Run initial query immediately
  }

  get totalPages() { return Math.ceil(this.filtered.length / this.pageSize); }
  get pagedRooms() { return this.filtered.slice(this.page * this.pageSize, this.page * this.pageSize + this.pageSize); }

  collectEquipment() {
    const set = new Set<string>();
    this.rooms.forEach(r => { if (r.equipment) r.equipment.split(',').map((s: string) => s.trim()).forEach((s: string) => s && set.add(s)); });
    this.equipmentOptions = Array.from(set);
  }

  search() {
    const v = this.fg.value;
    if (this.fg.invalid) { this.alert.show('Please complete the search fields'); return; }
    const start = new Date(v.date + 'T' + v.start);
    const end = new Date(v.date + 'T' + v.end);
    if (start >= end) { this.alert.show('Start time must be before end time'); return; }
    this.roomSvc.available(toLocalISOString(start), toLocalISOString(end), v.capacity || undefined, v.equipment || undefined).subscribe(r => {
      this.filtered = r || [];
      this.searched = true;
      this.page = 0;
    });
  }

  toggleResource(resource: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedResourceIds.add(resource.id);
    else this.selectedResourceIds.delete(resource.id);
  }

  openBookingModal(room: any) {
    this.selectedRoom = room;
    this.selectedResourceIds.clear();
    const searchVal = this.fg.value;
    this.bookingFg.patchValue({
      date: searchVal.date,
      start: searchVal.start,
      end: searchVal.end,
      title: 'Team meeting',
      description: '',
      capacity: searchVal.capacity
    });
  }

  closeBookingModal() {
    this.selectedRoom = null;
  }

  submitBooking() {
    if (this.bookingFg.invalid || !this.selectedRoom) return;
    const v = this.bookingFg.value;
    const start = new Date(v.date + 'T' + v.start);
    const end = new Date(v.date + 'T' + v.end);
    if (start >= end) { this.alert.show('Start time must be before end time'); return; }
    const resources = Array.from(this.selectedResourceIds).map(id => ({ resourceId: id, quantity: 1 }));
    const payload = {
      roomId: this.selectedRoom.id,
      startTime: toLocalISOString(start),
      endTime: toLocalISOString(end),
      title: v.title,
      description: v.description,
      createdBy: sessionStorage.getItem('username') || 'anonymous',
      resources
    };
    this.bookingSvc.create(payload).subscribe({
      next: (saved) => {
        this.alert.show(saved.status === 'PENDING' ? 'Booking submitted for approval' : 'Booking confirmed', 'success');
        window.dispatchEvent(new Event('bookingsChanged'));
        this.selectedRoom = null;
        this.search();
      },
      error: (err) => {
        // Handled by api interceptor
      }
    });
  }
}
