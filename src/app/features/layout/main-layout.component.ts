import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-dvh bg-slate-50 text-slate-900">
      <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
          <button
            class="btn-ghost lg:hidden"
            (click)="sidebarOpen.set(!sidebarOpen())"
            type="button"
          >
            menu
          </button>
          <h1 class="text-sm font-bold tracking-wide">OS Facil</h1>
          <span class="ml-2 text-xs text-slate-500">Gestao de Ordem de Servico</span>
          <div class="ml-auto">
            <button class="btn-ghost" (click)="logout()" type="button">Sair</button>
          </div>
        </div>
      </header>

      <div class="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[250px_1fr]">
        <aside
          class="border-r border-slate-200 bg-white p-3 lg:block"
          [class.hidden]="!sidebarOpen() && isMobile()"
        >
          <nav class="space-y-1 text-sm">
            @for (item of menu; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-sky-100 text-sky-900"
                class="block rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                (click)="closeOnMobile()"
              >
                {{ item.label }}
              </a>
            }
          </nav>
        </aside>

        <main class="p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarOpen = signal(true);
  readonly isMobile = signal(false);

  readonly menu = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Clientes', route: '/clientes' },
    { label: 'Funcionarios', route: '/funcionarios' },
    { label: 'Veiculos', route: '/veiculos' },
    { label: 'Ordens de Servico', route: '/ordem-servicos' },
    { label: 'Produtos', route: '/produtos' },
    { label: 'Itens de Produto', route: '/item-produtos' },
    { label: 'Pagamentos', route: '/pagamentos' },
  ];

  constructor() {
    this.applyViewport(window.innerWidth);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.applyViewport(window.innerWidth);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeOnMobile(): void {
    if (this.isMobile()) this.sidebarOpen.set(false);
  }

  private applyViewport(width: number): void {
    const mobile = width < 1024;
    this.isMobile.set(mobile);
    this.sidebarOpen.set(!mobile);
  }
}
