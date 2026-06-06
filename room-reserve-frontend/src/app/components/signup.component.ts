import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { AlertBannerComponent } from './alert-banner.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertBannerComponent, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  isSubmitting = false;
  fg = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    role: new FormControl('ROLE_USER', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
    ]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(private auth: AuthService, private router: Router, private alert: AlertService) {}

  get passwordsMatch() {
    return this.fg.value.password === this.fg.value.confirmPassword;
  }

  submit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      this.alert.show('Please complete all signup fields');
      return;
    }
    if (!this.passwordsMatch) {
      this.alert.show('Passwords must match');
      return;
    }

    const v = this.fg.value as any;
    this.isSubmitting = true;
    this.auth.register(v.username, v.password, v.role, v.name, v.email)
      .then(() => this.auth.login(v.username, v.password))
      .then(resp => {
        this.alert.show('Account created', 'success');
        this.router.navigate([this.auth.dashboardForRole(resp?.role)]);
      })
      .catch((err: any) => this.alert.show(err?.error || err?.message || 'Registration failed'))
      .finally(() => this.isSubmitting = false);
  }
}
