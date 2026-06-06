import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AlertService } from './alert.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { API_BASE } from '../config';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const alertSvc = inject(AlertService);
  const router = inject(Router);

  const apiReq = req.url.startsWith('/api') ? req.clone({ url: `${API_BASE}${req.url}` }) : req;
  const authReq = token ? apiReq.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : apiReq;

  return next(authReq).pipe(catchError((error: any) => {
    if (error?.status === 401 || error?.status === 403) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('role');
      router.navigate(['/login']);
    }
    const err = error?.error;
    const msg = typeof err === 'string' ? err : (error?.message || 'Please provide a valid request');
    alertSvc.show(msg);
    return throwError(() => error);
  }));
};
