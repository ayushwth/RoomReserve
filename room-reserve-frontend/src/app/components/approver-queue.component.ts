import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-approver-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approver-queue.component.html',
  styleUrl: './approver-queue.component.css'
})
export class ApproverQueueComponent implements OnInit {
  bookings: any[] = [];
  rejectingId: number | null = null;
  rejectReason = '';

  constructor(private bookingSvc: BookingService, private alert: AlertService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.bookingSvc.list('PENDING').subscribe(b => this.bookings = (b || []).map(x => ({
      ...x,
      startTime: x.startTime ? new Date(x.startTime) : null,
      endTime: x.endTime ? new Date(x.endTime) : null
    })));
  }

  decide(id: number, status: string) {
    const reason = status === 'REJECTED' ? this.rejectReason : undefined;
    this.bookingSvc.patchStatus(id, status, reason).subscribe(() => {
      const msg = status === 'APPROVED' ? 'Booking approved successfully' : 'Booking rejected successfully';
      this.alert.show(msg, 'success');
      this.rejectingId = null;
      this.rejectReason = '';
      window.dispatchEvent(new Event('bookingsChanged'));
      this.load();
    });
  }

  openReject(id: number) {
    this.rejectingId = id;
    this.rejectReason = '';
  }

  cancelReject() {
    this.rejectingId = null;
    this.rejectReason = '';
  }

  resourceSummary(b: any) {
    return (b.resources || []).map((r: any) => `${r.name} x${r.quantity || 1}`).join(', ');
  }
}
