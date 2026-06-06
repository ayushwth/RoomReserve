import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResourceService } from '../services/resource.service';

@Component({
  selector: 'app-resources-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resources-tab.component.html',
  styleUrl: './resources-tab.component.css'
})
export class ResourcesTabComponent implements OnInit {
  resources: any[] = [];
  editing = false;
  fg = new FormGroup({
    id: new FormControl<number | null>(null),
    name: new FormControl('', Validators.required),
    type: new FormControl(''),
    quantity: new FormControl(1, Validators.required),
    active: new FormControl(true)
  });

  constructor(private resourceSvc: ResourceService) {}

  ngOnInit() { this.load(); }
  load() { this.resourceSvc.list().subscribe(r => this.resources = r || []); }
  edit(r: any) { this.editing = true; this.fg.patchValue(r); }
  reset() { this.editing = false; this.fg.reset({ id: null, name: '', type: '', quantity: 1, active: true }); }
  save() {
    const payload = this.fg.value as any;
    const done = () => { this.load(); this.reset(); };
    if (payload.id) this.resourceSvc.update(payload.id, payload).subscribe(done);
    else this.resourceSvc.create(payload).subscribe(done);
  }
}
