import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RoomsTabComponent } from './rooms-tab.component';
import { ResourcesTabComponent } from './resources-tab.component';
import { FacilitySettingsTabComponent } from './facility-settings-tab.component';
import { ComplianceLogTabComponent } from './compliance-log-tab.component';
import { ApproverQueueComponent } from './approver-queue.component';
import { AlertBannerComponent } from './alert-banner.component';
import { CalendarViewComponent } from './calendar-view.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RoomsTabComponent, ResourcesTabComponent, FacilitySettingsTabComponent, ComplianceLogTabComponent, ApproverQueueComponent, AlertBannerComponent, CalendarViewComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  active: 'rooms' | 'resources' | 'calendar' | 'approvals' | 'settings' | 'compliance' | null = null;
  greeting = 'Welcome back';
  liveTime = '';
  liveDate = '';
  private clockInterval: any;

  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab === 'rooms' || tab === 'resources' || tab === 'calendar' || tab === 'approvals' || tab === 'settings' || tab === 'compliance') {
        this.active = tab;
      } else {
        this.active = null;
      }
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
    const val = sessionStorage.getItem('name') || sessionStorage.getItem('username') || 'Admin';
    if (!val) return 'Admin';
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
