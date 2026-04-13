import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private idSeed = 0;
  readonly messages = signal<ToastMessage[]>([]);

  success(message: string): void {
    this.push('success', message, 3000);
  }

  error(message: string): void {
    this.push('error', message, 5000);
  }

  warning(message: string): void {
    this.push('warning', message, 5000);
  }

  remove(id: number): void {
    this.messages.update((list) => list.filter((item) => item.id !== id));
  }

  private push(type: ToastType, message: string, timeout: number): void {
    const id = ++this.idSeed;
    this.messages.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.remove(id), timeout);
  }
}
