import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: '<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" [ngClass]="chipClass">{{ label }}</span>'
})
export class StatusBadgeComponent {
  @Input() label = '';

  get chipClass(): string {
    const normalized = this.label.toLowerCase();
    if (normalized.includes('concl')) return 'bg-emerald-100 text-emerald-800';
    if (normalized.includes('anda')) return 'bg-sky-100 text-sky-800';
    if (normalized.includes('cancel')) return 'bg-rose-100 text-rose-800';
    return 'bg-amber-100 text-amber-800';
  }
}
