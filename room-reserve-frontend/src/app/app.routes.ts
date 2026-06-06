import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './services/api.interceptor';
import { requireAuth, requireRole } from './services/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', loadComponent: () => import('./components/login.component').then(m => m.LoginComponent) },
	{ path: 'signup', loadComponent: () => import('./components/signup.component').then(m => m.SignupComponent) },
	{ path: 'forgot-password', loadComponent: () => import('./components/forgot-password.component').then(m => m.ForgotPasswordComponent) },
	{ path: 'admin', canActivate: [requireRole(['ROLE_ADMIN'])], loadComponent: () => import('./components/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
	{ path: 'approver', canActivate: [requireRole(['ROLE_APPROVER', 'ROLE_ADMIN'])], loadComponent: () => import('./components/approver-dashboard.component').then(m => m.ApproverDashboardComponent) },
	{ path: 'user', canActivate: [requireAuth], loadComponent: () => import('./components/employee-dashboard.component').then(m => m.EmployeeDashboardComponent) },
	{ path: 'employee', redirectTo: 'user', pathMatch: 'full' },
	{ path: 'calendar', canActivate: [requireAuth], loadComponent: () => import('./components/calendar-page.component').then(m => m.CalendarPageComponent) },
	{ path: 'book-room', canActivate: [requireAuth], loadComponent: () => import('./components/book-room-page.component').then(m => m.BookRoomPageComponent) },
	{ path: 'book-amenities', canActivate: [requireAuth], loadComponent: () => import('./components/book-amenities-page.component').then(m => m.BookAmenitiesPageComponent) },
	{ path: 'profile', canActivate: [requireAuth], loadComponent: () => import('./components/profile.component').then(m => m.ProfileComponent) },
	{ path: 'my-bookings', canActivate: [requireAuth], loadComponent: () => import('./components/my-bookings-page.component').then(m => m.MyBookingsPageComponent) }
];

export const extraProviders = [
	importProvidersFrom(),
	provideHttpClient(withInterceptors([apiInterceptor]))
];
