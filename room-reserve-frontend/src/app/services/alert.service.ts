import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AlertMessage {
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private _msg = new BehaviorSubject<AlertMessage | null>(null);
  readonly message$ = this._msg.asObservable();

  show(message: string, type: 'success' | 'error' = 'error') {
    this._msg.next({ text: message, type });
    // auto-dismiss after 4 seconds
    setTimeout(() => {
      const current = this._msg.value;
      if (current && current.text === message) {
        this.clear();
      }
    }, 4000);
  }

  clear() {
    this._msg.next(null);
  }
}
