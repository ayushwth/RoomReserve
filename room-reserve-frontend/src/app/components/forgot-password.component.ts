import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { AlertBannerComponent } from './alert-banner.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertBannerComponent, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../components/signup.component.css' // sharing auth design styles
})
export class ForgotPasswordComponent {
  step: 'verify' | 'reset' = 'verify';
  email = '';
  isSubmitting = false;

  verifyFg = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ])
  });

  resetFg = new FormGroup({
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
    ]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(private auth: AuthService, private router: Router, private alert: AlertService) {}

  get passwordsMatch() {
    return this.resetFg.value.newPassword === this.resetFg.value.confirmPassword;
  }

  verifyEmail() {
    if (this.verifyFg.invalid) {
      this.verifyFg.markAllAsTouched();
      return;
    }
    const val = this.verifyFg.value as any;
    this.isSubmitting = true;
    this.auth.forgotPassword(val.email)
      .then(resp => {
        if (resp && resp.verified) {
          this.email = val.email;
          this.step = 'reset';
          this.alert.show('Email verified. Please set your new password.', 'success');
        }
      })
      .catch(err => {
        this.alert.show(err?.error || err?.message || 'Email not found or error occurred');
      })
      .finally(() => this.isSubmitting = false);
  }

  resetPassword() {
    if (this.resetFg.invalid) {
      this.resetFg.markAllAsTouched();
      return;
    }
    if (!this.passwordsMatch) {
      this.alert.show('Passwords do not match');
      return;
    }
    const val = this.resetFg.value as any;
    this.isSubmitting = true;
    this.auth.resetPassword(this.email, val.newPassword)
      .then(() => {
        this.alert.show('Password successfully reset! Redirecting to login...', 'success');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      })
      .catch(err => {
        this.alert.show(err?.error || err?.message || 'Reset failed');
      })
      .finally(() => this.isSubmitting = false);
  }
}
