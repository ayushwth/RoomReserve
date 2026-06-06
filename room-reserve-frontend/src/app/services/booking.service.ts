import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingResourceDto { resourceId?: number; name?: string; type?: string; quantity?: number }
export interface BookingDto {
  id?: number;
  roomId?: number;
  roomName?: string;
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
  createdBy?: string;
  status?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  resources?: BookingResourceDto[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}
  list(status?: string, createdBy?: string): Observable<BookingDto[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (createdBy) params = params.set('createdBy', createdBy);
    return this.http.get<BookingDto[]>('/api/bookings', { params });
  }
  create(payload: any) { return this.http.post<BookingDto>('/api/bookings', payload); }
  update(id: number, payload: any) { return this.http.put<BookingDto>(`/api/bookings/${id}`, payload); }
  patchStatus(id: number, status: string, reason?: string) { return this.http.patch<BookingDto>(`/api/bookings/${id}/status`, { status, reason }); }
  cancel(id: number, reason?: string) { return this.http.patch<BookingDto>(`/api/bookings/${id}/cancel`, { reason }); }
  delete(id: number) { return this.cancel(id); }
}
