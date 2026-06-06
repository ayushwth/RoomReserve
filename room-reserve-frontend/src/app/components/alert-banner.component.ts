import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertMessage } from '../services/alert.service';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-banner.component.html',
  styleUrl: './alert-banner.component.css'
})
export class AlertBannerComponent {
  alertMsg: AlertMessage | null = null;
  constructor(private alert: AlertService) {
    this.alert.message$.subscribe(m => this.alertMsg = m);
  }
  clear() { this.alert.clear(); }
}
