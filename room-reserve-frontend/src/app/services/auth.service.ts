import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(username: string, password: string) {
    return this.http.post<{ token: string; username: string; role: string; name?: string }>('/api/auth/login', { username, password })
      .toPromise()
      .then(resp => {
        if (resp && resp.token) {
          sessionStorage.setItem('token', resp.token);
          sessionStorage.setItem('username', resp.username || username);
          sessionStorage.setItem('role', resp.role || 'ROLE_USER');
          sessionStorage.setItem('name', resp.name || resp.username || username);
        }
        return resp;
      });
  }

  register(username: string, password: string, role: string, name?: string, email?: string) {
    return this.http.post('/api/auth/register', { username, password, role, name, email }).toPromise();
  }

  logout() {
    const username = sessionStorage.getItem('username');
    if (username) {
      this.http.post('/api/auth/logout', { username }).toPromise().catch(() => {});
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('name');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getRole(): string {
    return sessionStorage.getItem('role') || 'ROLE_USER';
  }

  dashboardForRole(role = this.getRole()): string {
    if (role === 'ROLE_ADMIN') return '/admin';
    if (role === 'ROLE_APPROVER') return '/approver';
    return '/user';
  }

  forgotPassword(email: string) {
    return this.http.post<{ email: string; verified: boolean }>('/api/auth/forgot-password', { email }).toPromise();
  }

  resetPassword(email: string, newPassword: string) {
    return this.http.post('/api/auth/reset-password', { email, newPassword }).toPromise();
  }

  getProfile() {
    return this.http.get<UserProfile>('/api/users/profile').toPromise();
  }

  updateProfile(profile: Partial<UserProfile> & { password?: string }) {
    return this.http.put<UserProfile>('/api/users/profile', profile).toPromise();
  }
}
