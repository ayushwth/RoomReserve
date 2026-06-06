import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResourceDto {
  id?: number;
  name: string;
  type?: string;
  quantity?: number;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  constructor(private http: HttpClient) {}

  list(): Observable<ResourceDto[]> { return this.http.get<ResourceDto[]>('/api/resources'); }
  create(resource: Partial<ResourceDto>) { return this.http.post<ResourceDto>('/api/resources', resource); }
  update(id: number, resource: Partial<ResourceDto>) { return this.http.put<ResourceDto>(`/api/resources/${id}`, resource); }
}
