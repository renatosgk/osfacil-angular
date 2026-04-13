import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly loading = signal(false);
  private pendingRequests = 0;

  start(): void {
    this.pendingRequests += 1;
    this.loading.set(true);
  }

  stop(): void {
    this.pendingRequests = Math.max(this.pendingRequests - 1, 0);
    this.loading.set(this.pendingRequests > 0);
  }
}
