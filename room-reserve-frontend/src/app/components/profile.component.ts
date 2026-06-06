import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService, UserProfile } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { AlertBannerComponent } from './alert-banner.component';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AlertBannerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  isSaving = false;

  pendingCount = 0;
  approvedCount = 0;
  cancelledCount = 0;
  rejectedCount = 0;

  fg = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl('', [
      Validators.pattern(/^(?:|(?=.*[a-zA-Z])(?=.*\d).{6,})$/)
    ])
  });

  constructor(private auth: AuthService, private alert: AlertService, private bookingSvc: BookingService) {}

  ngOnInit() {
    this.load();
    this.loadStats();
  }

  load() {
    this.auth.getProfile()
      .then(p => {
        if (p) {
          this.profile = p;
          this.fg.patchValue({
            name: p.name,
            email: p.email,
            password: ''
          });
        }
      })
      .catch(err => {
        this.alert.show(err?.error || err?.message || 'Failed to load profile details');
      });
  }

  save() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }
    const val = this.fg.value as any;
    const payload: any = {
      name: val.name,
      email: val.email
    };
    if (val.password && val.password.trim().length >= 6) {
      payload.password = val.password;
    } else if (val.password && val.password.trim().length > 0) {
      this.alert.show('New password must be at least 6 characters');
      return;
    }

    this.isSaving = true;
    this.auth.updateProfile(payload)
      .then(updated => {
        this.alert.show('Profile updated successfully!', 'success');
        if (updated) {
          this.profile = updated;
          this.fg.patchValue({ password: '' });
          if (updated.username) {
            sessionStorage.setItem('username', updated.username);
          }
        }
      })
      .catch(err => {
        this.alert.show(err?.error || err?.message || 'Failed to update profile details');
      })
      .finally(() => this.isSaving = false);
  }

  username() { return this.profile?.username || sessionStorage.getItem('username') || 'Signed in user'; }
  role() { return this.profile?.role || this.auth.getRole(); }
  roleLabel() { return this.role().replace('ROLE_', '').toLowerCase(); }
  dashboardLink() { return this.auth.dashboardForRole(); }
  isEmployee() { return this.role() === 'ROLE_USER' || this.role() === 'ROLE_EMPLOYEE'; }
  isAdmin() { return this.role() === 'ROLE_ADMIN'; }
  isApprover() { return this.role() === 'ROLE_APPROVER'; }

  loadStats() {
    const isEmp = this.isEmployee();
    const username = isEmp ? (sessionStorage.getItem('username') || undefined) : undefined;
    this.bookingSvc.list(undefined, username).subscribe({
      next: (list) => {
        this.pendingCount = list.filter(b => b.status === 'PENDING').length;
        this.approvedCount = list.filter(b => b.status === 'APPROVED').length;
        this.cancelledCount = list.filter(b => b.status === 'CANCELLED').length;
        this.rejectedCount = list.filter(b => b.status === 'REJECTED').length;
      },
      error: () => {}
    });
  }
}
