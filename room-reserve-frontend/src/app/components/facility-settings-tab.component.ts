import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { FacilityService } from '../services/facility.service';
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
  selector: 'app-facility-settings-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facility-settings-tab.component.html',
  styleUrl: './facility-settings-tab.component.css'
})
export class FacilitySettingsTabComponent implements OnInit {
  fg = new FormGroup({ openTime: new FormControl('08:00'), closeTime: new FormControl('18:00'), maintenanceStart: new FormControl(''), maintenanceEnd: new FormControl(''), maintenanceReason: new FormControl('') });
  constructor(private facility: FacilityService, private alert: AlertService) {}
  ngOnInit() { this.facility.get().subscribe(s => {
    if (s) {
      this.fg.patchValue({ openTime: s.openTime || '08:00', closeTime: s.closeTime || '18:00', maintenanceStart: toLocalDatetimeString(s.maintenanceStart), maintenanceEnd: toLocalDatetimeString(s.maintenanceEnd), maintenanceReason: s.maintenanceReason || '' });
    }
  }); }
  save() {
    const v = this.fg.value as any;
    const payload: any = { openTime: v.openTime, closeTime: v.closeTime, maintenanceReason: v.maintenanceReason };
    if (v.maintenanceStart) payload.maintenanceStart = new Date(v.maintenanceStart).toISOString();
    if (v.maintenanceEnd) payload.maintenanceEnd = new Date(v.maintenanceEnd).toISOString();
    this.facility.update(payload).subscribe(() => this.alert.show('Facility settings saved'));
  }
}
