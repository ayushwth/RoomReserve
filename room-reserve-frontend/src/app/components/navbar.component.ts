import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private auth: AuthService, private router: Router) {}
  isLoggedIn() { return !!this.auth.getToken(); }
  displayName() {
    const val = sessionStorage.getItem('name') || sessionStorage.getItem('username') || '';
    if (!val) return '';
    let name = val.includes('@') ? val.split('@')[0] : val;
    name = name.replace(/[._-]/g, ' ');
    return name.replace(/\b\w/g, c => c.toUpperCase());
  }
  role() { return this.auth.getRole(); }
  roleLabel() { return this.role().replace('ROLE_', '').toLowerCase(); }
  dashboardLink() { return this.auth.dashboardForRole(); }
  isEmployee() { return this.role() === 'ROLE_USER' || this.role() === 'ROLE_EMPLOYEE'; }
  isAdmin() { return this.role() === 'ROLE_ADMIN'; }
  isApprover() { return this.role() === 'ROLE_APPROVER'; }
  logout() { this.auth.logout(); }
}
