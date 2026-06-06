import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { AuditLogService } from '../services/audit-log.service';

@Component({
  selector: 'app-compliance-log-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './compliance-log-tab.component.html',
  styleUrl: './compliance-log-tab.component.css'
})
export class ComplianceLogTabComponent implements OnInit {
  logs: any[] = [];
  fg = new FormGroup({ from: new FormControl(''), to: new FormControl(''), booking: new FormControl(''), room: new FormControl('') });
  constructor(private audit: AuditLogService) {}
  ngOnInit() { this.load(); }
  load() {
    const v = this.fg.value;
    this.audit.list({
      from: v.from ? new Date(v.from).toISOString() : undefined,
      to: v.to ? new Date(v.to + 'T23:59:59').toISOString() : undefined,
      booking: v.booking || undefined,
      room: v.room || undefined
    }).subscribe(logs => this.logs = logs || []);
  }
}
