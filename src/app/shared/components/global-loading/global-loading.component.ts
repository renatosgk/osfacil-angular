import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.loading()) {
      <div class="fixed inset-0 z-[9999] grid place-items-center bg-black/25">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-slate-700"></div>
      </div>
    }
  `
})
export class GlobalLoadingComponent {
  readonly loadingService = inject(LoadingService);
}
