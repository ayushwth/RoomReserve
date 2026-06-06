import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  fg = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  constructor(private auth: AuthService, private router: Router, private alert: AlertService) {}
  submit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }
    const v = this.fg.value as any;
    this.auth.login(v.username, v.password)
      .then(resp => this.router.navigate([this.auth.dashboardForRole(resp?.role)]))
      .catch(() => this.alert.show('Invalid username or password'));
  }
}
