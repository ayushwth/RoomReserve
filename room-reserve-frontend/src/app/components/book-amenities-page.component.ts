import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResourceService } from '../services/resource.service';
import { SearchPanelComponent } from './search-panel.component';
import { AlertBannerComponent } from './alert-banner.component';

@Component({
  selector: 'app-book-amenities-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchPanelComponent, AlertBannerComponent],
  templateUrl: './book-amenities-page.component.html',
  styleUrl: './book-amenities-page.component.css'
})
export class BookAmenitiesPageComponent implements OnInit {
  resources: any[] = [];

  constructor(private resourceSvc: ResourceService) {}

  ngOnInit() {
    this.resourceSvc.list().subscribe(resources => {
      this.resources = (resources || []).filter(resource => resource.active !== false);
    });
  }
}
