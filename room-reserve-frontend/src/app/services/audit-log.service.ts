import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLogDto {
  id: number;
  action: string;
  username: string;
  timestamp: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  constructor(private http: HttpClient) {}

  list(filters: { from?: string; to?: string; booking?: string; room?: string } = {}): Observable<AuditLogDto[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<AuditLogDto[]>('/api/audit-logs', { params });
  }
}
