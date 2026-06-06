import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApproverQueueComponent } from './approver-queue.component';
import { AlertBannerComponent } from './alert-banner.component';

@Component({
  selector: 'app-approver-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ApproverQueueComponent, AlertBannerComponent],
  templateUrl: './approver-dashboard.component.html',
  styleUrls: ['./approver-dashboard.component.css']
})
export class ApproverDashboardComponent implements OnInit, OnDestroy {
  active: 'queue' | null = null;
  greeting = 'Welcome back';
  liveTime = '';
  liveDate = '';
  private clockInterval: any;

  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      this.active = params.get('tab') === 'queue' ? 'queue' : null;
    });
  }

  ngOnInit() {
    this.updateGreeting();
    this.updateClock();
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  get displayName(): string {
    const val = sessionStorage.getItem('name') || sessionStorage.getItem('username') || 'Approver';
    if (!val) return 'Approver';
    let name = val.includes('@') ? val.split('@')[0] : val;
    name = name.replace(/[._-]/g, ' ');
    return name.replace(/\b\w/g, c => c.toUpperCase());
  }

  private updateGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) this.greeting = 'Good morning';
    else if (hr < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  private updateClock() {
    const now = new Date();
    this.liveTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.liveDate = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }

  get greetingClass(): string {
    const hr = new Date().getHours();
    if (hr < 12) return 'morning-theme';
    if (hr < 17) return 'afternoon-theme';
    return 'evening-theme';
  }
}
