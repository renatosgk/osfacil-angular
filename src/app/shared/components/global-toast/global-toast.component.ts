import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pointer-events-none fixed right-4 top-4 z-[10000] flex w-[min(420px,90vw)] flex-col gap-2">
      @for (toast of notification.messages(); track toast.id) {
        <div
          class="pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg"
          [class.border-emerald-300]="toast.type === 'success'"
          [class.bg-emerald-50]="toast.type === 'success'"
          [class.text-emerald-900]="toast.type === 'success'"
          [class.border-rose-300]="toast.type === 'error'"
          [class.bg-rose-50]="toast.type === 'error'"
          [class.text-rose-900]="toast.type === 'error'"
          [class.border-amber-300]="toast.type === 'warning'"
          [class.bg-amber-50]="toast.type === 'warning'"
          [class.text-amber-900]="toast.type === 'warning'"
        >
          <div class="flex items-center justify-between gap-2">
            <span>{{ toast.message }}</span>
            <button class="rounded px-2 py-1 text-xs" (click)="notification.remove(toast.id)">fechar</button>
          </div>
        </div>
      }
    </div>
  `
})
export class GlobalToastComponent {
  readonly notification = inject(NotificationService);
}
