import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPanelComponent } from './search-panel.component';
import { AlertBannerComponent } from './alert-banner.component';
import { CalendarViewComponent } from './calendar-view.component';

@Component({
  selector: 'app-book-room-page',
  standalone: true,
  imports: [CommonModule, SearchPanelComponent, AlertBannerComponent, CalendarViewComponent],
  templateUrl: './book-room-page.component.html',
  styleUrl: './book-room-page.component.css'
})
export class BookRoomPageComponent {
  username = sessionStorage.getItem('username') || 'there';
}
