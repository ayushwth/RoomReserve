import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RoomService } from '../services/room.service';
import { ResourceService } from '../services/resource.service';
import { AlertService } from '../services/alert.service';

function toLocalDatetimeString(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

@Component({
  selector: 'app-rooms-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rooms-tab.component.html',
  styleUrl: './rooms-tab.component.css'
})
export class RoomsTabComponent implements OnInit {
  rooms: any[] = [];
  resources: any[] = [];
  editing = false;
  selectedResourceNames = new Set<string>();

  locations = [
    'Building 1, Floor 1',
    'Building 1, Floor 2',
    'Building 1, Floor 3',
    'Building 2, Floor 1',
    'Building 2, Floor 2',
    'Building 2, Floor 3',
    'Building 3, Floor 1',
    'Building 3, Floor 2',
    'Building 3, Floor 3',
    'Executive Wing, Floor 1',
    'Executive Wing, Floor 2',
    'Tech Hub, Floor 1',
    'Tech Hub, Floor 2'
  ];

  capacities = [50, 75, 100, 150, 300, 400, 500];

  fg = new FormGroup({
    id: new FormControl<number | null>(null),
    name: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    capacity: new FormControl(50, Validators.required),
    equipment: new FormControl(''),
    active: new FormControl(true),
    requiresApproval: new FormControl(false),
    maintenance: new FormControl(false),
    maintenanceStart: new FormControl(''),
    maintenanceEnd: new FormControl(''),
    maintenanceReason: new FormControl('')
  });

  constructor(
    private roomSvc: RoomService,
    private resourceSvc: ResourceService,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.load();
    this.resourceSvc.list().subscribe(r => this.resources = r || []);
  }

  load() {
    this.roomSvc.list().subscribe(r => this.rooms = r || []);
  }

  edit(r: any) {
    this.editing = true;
    this.selectedResourceNames.clear();
    if (r.equipment) {
      r.equipment.split(',').map((s: string) => s.trim()).forEach((s: string) => {
        if (s) this.selectedResourceNames.add(s);
      });
    }
    this.fg.patchValue({
      ...r,
      maintenanceStart: toLocalDatetimeString(r.maintenanceStart),
      maintenanceEnd: toLocalDatetimeString(r.maintenanceEnd)
    });
  }

  reset() {
    this.editing = false;
    this.selectedResourceNames.clear();
    this.fg.reset({
      id: null,
      name: '',
      location: '',
      capacity: 50,
      equipment: '',
      active: true,
      requiresApproval: false,
      maintenance: false,
      maintenanceStart: '',
      maintenanceEnd: '',
      maintenanceReason: ''
    });
  }

  toggleResource(name: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedResourceNames.add(name);
    } else {
      this.selectedResourceNames.delete(name);
    }
    this.fg.patchValue({
      equipment: Array.from(this.selectedResourceNames).join(', ')
    });
  }

  isResourceAssignedToOtherRoom(resourceName: string): string | null {
    const currentRoomId = this.fg.value.id;
    for (const r of this.rooms) {
      if (currentRoomId && r.id === currentRoomId) continue;
      if (r.equipment) {
        const eqList = r.equipment.split(',').map((s: string) => s.trim().toLowerCase());
        if (eqList.includes(resourceName.toLowerCase())) {
          return r.name;
        }
      }
    }
    return null;
  }

  save() {
    const v = this.fg.value as any;
    const payload = {
      ...v,
      maintenanceStart: v.maintenanceStart ? new Date(v.maintenanceStart).toISOString() : null,
      maintenanceEnd: v.maintenanceEnd ? new Date(v.maintenanceEnd).toISOString() : null
    };
    const done = () => { this.load(); this.reset(); };
    if (v.id) {
      this.roomSvc.update(v.id, payload).subscribe({
        next: done,
        error: (err) => this.alert.show(err?.error || 'Failed to update room')
      });
    } else {
      this.roomSvc.create(payload).subscribe({
        next: done,
        error: (err) => this.alert.show(err?.error || 'Failed to create room')
      });
    }
  }

  deleteRoom() {
    const id = this.fg.value.id;
    if (!id) return;
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomSvc.delete(id).subscribe({
        next: () => {
          this.alert.show('Room deleted successfully', 'success');
          this.load();
          this.reset();
        },
        error: (err) => {
          this.alert.show(err?.error || 'Failed to delete room');
        }
      });
    }
  }
}
