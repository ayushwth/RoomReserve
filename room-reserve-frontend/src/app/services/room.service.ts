import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoomDto {
  id?: number;
  name: string;
  location?: string;
  capacity?: number;
  equipment?: string;
  active?: boolean;
  requiresApproval?: boolean;
  maintenance?: boolean;
  maintenanceStart?: string;
  maintenanceEnd?: string;
  maintenanceReason?: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  constructor(private http: HttpClient) {}

  list(): Observable<RoomDto[]> {
    return this.http.get<RoomDto[]>('/api/rooms');
  }

  create(room: Partial<RoomDto>) {
    return this.http.post<RoomDto>('/api/rooms', room);
  }

  update(id: number, room: Partial<RoomDto>) {
    return this.http.put<RoomDto>(`/api/rooms/${id}`, room);
  }

  available(startIso: string, endIso: string, capacity?: number, equipment?: string) {
    let params = new HttpParams().set('start', startIso).set('end', endIso);
    if (capacity != null) params = params.set('capacity', String(capacity));
    if (equipment) params = params.set('equipment', equipment);
    return this.http.get<RoomDto[]>('/api/rooms/available', { params });
  }

  delete(id: number) {
    return this.http.delete(`/api/rooms/${id}`);
  }
}
