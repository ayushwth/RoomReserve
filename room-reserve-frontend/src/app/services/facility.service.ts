import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacilitySettings { id?: number; openTime?: string; closeTime?: string; maintenanceStart?: string; maintenanceEnd?: string; maintenanceReason?: string }

@Injectable({ providedIn: 'root' })
export class FacilityService {
  constructor(private http: HttpClient) {}
  get(): Observable<FacilitySettings> { return this.http.get<FacilitySettings>('/api/facility'); }
  update(payload: FacilitySettings) { return this.http.put<FacilitySettings>('/api/facility', payload); }
}
