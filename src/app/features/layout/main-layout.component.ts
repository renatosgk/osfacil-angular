import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    .sidebar {
      width: 256px;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      height: 100dvh;
      position: sticky;
      top: 0;
      flex-shrink: 0;
      transition: transform 0.25s ease;
      z-index: 40;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      background: #fff;
    }
    .brand-mark img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .brand-name {
      color: #fff;
      font-size: 0.9375rem;
      font-weight: 600;
      margin: 0;
      line-height: 1.2;
    }
    .brand-sub {
      color: #64748b;
      font-size: 0.6875rem;
      margin: 0;
    }
    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0.625rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-nav::-webkit-scrollbar { width: 3px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
    .nav-item {
      display: block;
      padding: 0.625rem 0.875rem;
      border-radius: 10px;
      font-size: 0.875rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.15s;
      cursor: pointer;
    }
    .nav-item:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; }
    .nav-item.active { background: rgba(37,99,235,0.2); color: #93c5fd; font-weight: 500; }
    .nav-divider {
      height: 1px;
      background: rgba(255,255,255,0.07);
      margin: 0.5rem 0.625rem;
    }
    .nav-section-title {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #475569;
      padding: 0.625rem 0.875rem 0.25rem;
    }
    .sidebar-footer {
      padding: 0.75rem 0.625rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .btn-logout {
      display: block;
      width: 100%;
      padding: 0.625rem 0.875rem;
      border-radius: 10px;
      font-size: 0.875rem;
      color: #f87171;
      background: transparent;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-logout:hover { background: rgba(239,68,68,0.12); color: #fca5a5; }
    .mobile-header {
      display: none;
      position: sticky;
      top: 0;
      z-index: 30;
      background: #0f172a;
      padding: 0 1rem;
      height: 56px;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .btn-hamburger {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.375rem;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
      transition: color 0.15s;
    }
    .btn-hamburger:hover { color: #fff; }
    .mobile-brand { color: #fff; font-size: 0.9375rem; font-weight: 600; }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 35;
    }
    @media (max-width: 1023px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100dvh;
      }
      .sidebar.hidden-mobile {
        transform: translateX(-100%);
      }
      .mobile-header { display: flex; }
    }
  `],
  template: `
    <div class="flex min-h-dvh bg-slate-50">

      <aside class="sidebar" [class.hidden-mobile]="!sidebarOpen()">
        <div class="sidebar-brand">
          <div class="brand-mark">
            <img src="logo.png" alt="OS Fácil" onerror="this.style.display='none'" />
          </div>
          <div>
            <p class="brand-name">OS Fácil</p>
            <p class="brand-sub">Gestão de Oficina</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          @for (item of mainMenu(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              (click)="closeOnMobile()"
            >{{ item.label }}</a>
          }
          <div class="nav-divider"></div>
          @for (item of toolsMenu; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              (click)="closeOnMobile()"
            >{{ item.label }}</a>
          }
          @if (authService.isStaff()) {
            <div class="nav-divider"></div>
            <p class="nav-section-title">Administração</p>
            @for (item of adminMenu; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                class="nav-item"
                (click)="closeOnMobile()"
              >{{ item.label }}</a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          <div style="padding:0.5rem 0.875rem 0.625rem; display:flex; align-items:center; gap:0.625rem;">
            <div style="width:32px;height:32px;border-radius:50%;background:rgba(37,99,235,0.25);display:flex;align-items:center;justify-content:center;font-size:0.8125rem;font-weight:600;color:#93c5fd;flex-shrink:0;">
              {{ (authService.currentUser()?.nome ?? '?')[0].toUpperCase() }}
            </div>
            <div style="min-width:0;">
              <p style="margin:0;color:#e2e8f0;font-size:0.8125rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ authService.currentUser()?.nome ?? 'Usuário' }}
              </p>
              <p style="margin:0;color:#64748b;font-size:0.6875rem;">
                {{ authService.isCliente() ? 'Cliente' : authService.isAdmin() ? 'Admin' : 'Funcionário' }}
              </p>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()" type="button">Sair</button>
        </div>
      </aside>

      @if (sidebarOpen() && isMobile()) {
        <div class="overlay" (click)="sidebarOpen.set(false)"></div>
      }

      <div class="flex flex-1 flex-col min-w-0">
        <header class="mobile-header">
          <button class="btn-hamburger" (click)="sidebarOpen.set(!sidebarOpen())" type="button">&#9776;</button>
          <span class="mobile-brand">OS Fácil</span>
        </header>

        <main class="flex-1 p-5 lg:p-7">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarOpen = signal(true);
  readonly isMobile = signal(false);

  readonly staffMenu = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Clientes', route: '/clientes' },
    { label: 'Funcionários', route: '/funcionarios' },
    { label: 'Veículos', route: '/veiculos' },
    { label: 'Ordens de Serviço', route: '/ordem-servicos' },
    { label: 'Produtos', route: '/produtos' },
    { label: 'Itens de Produto', route: '/item-produtos' },
    { label: 'Pagamentos', route: '/pagamentos' },
  ];

  readonly clienteMenu = [
    { label: 'Minhas Ordens de Serviço', route: '/ordem-servicos' },
    { label: 'Meus Veículos', route: '/veiculos' },
    { label: 'Meus Pagamentos', route: '/pagamentos' },
  ];

  readonly mainMenu = computed(() =>
    this.authService.isCliente() ? this.clienteMenu : this.staffMenu
  );

  readonly toolsMenu = [
    { label: 'Assistente IA', route: '/assistente' },
  ];

  readonly adminMenu = [
    { label: 'Novo Funcionário', route: '/registro-funcionario' },
    { label: 'Novo Administrador', route: '/registro-admin' },
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
