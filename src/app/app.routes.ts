import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, staffGuard } from './core/guards/role.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./features/auth/auth.component').then((m) => m.AuthComponent)
	},
	{
		path: '',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./features/layout/main-layout.component').then((m) => m.MainLayoutComponent),
		children: [
			{
				path: 'dashboard',
				canActivate: [staffGuard],
				loadComponent: () =>
					import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
			},
			{
				path: 'clientes',
				canActivate: [staffGuard],
				loadComponent: () =>
					import('./features/clientes/clientes.component').then((m) => m.ClientesComponent)
			},
			{
				path: 'funcionarios',
				canActivate: [staffGuard],
				loadComponent: () =>
					import('./features/funcionarios/funcionarios.component').then((m) => m.FuncionariosComponent)
			},
			{
				path: 'produtos',
				canActivate: [staffGuard],
				loadComponent: () =>
					import('./features/produtos/produtos.component').then((m) => m.ProdutosComponent)
			},
			{
				path: 'item-produtos',
				canActivate: [staffGuard],
				loadComponent: () =>
					import('./features/item-produtos/item-produtos.component').then((m) => m.ItemProdutosComponent)
			},

			{
				path: 'registro-funcionario',
				canActivate: [staffGuard, adminGuard],
				loadComponent: () =>
					import('./features/registro-funcionario/registro-funcionario.component').then(
						(m) => m.RegistroFuncionarioComponent
					)
			},
			{
				path: 'registro-admin',
				canActivate: [staffGuard, adminGuard],
				loadComponent: () =>
					import('./features/registro-admin/registro-admin.component').then(
						(m) => m.RegistroAdminComponent
					)
			},

			{
				path: 'veiculos',
				loadComponent: () =>
					import('./features/veiculos/veiculos.component').then((m) => m.VeiculosComponent)
			},
			{
				path: 'ordem-servicos',
				loadComponent: () =>
					import('./features/ordem-servicos/ordem-servicos.component').then((m) => m.OrdemServicosComponent)
			},
			{
				path: 'ordem-servicos/:id',
				loadComponent: () =>
					import('./features/ordem-servicos/ordem-servico-detalhe.component').then(
						(m) => m.OrdemServicoDetalheComponent
					)
			},
			{
				path: 'pagamentos',
				loadComponent: () =>
					import('./features/pagamentos/pagamentos.component').then((m) => m.PagamentosComponent)
			},
			{
				path: 'assistente',
				loadComponent: () =>
					import('./features/assistente/assistente.component').then((m) => m.AssistenteComponent)
			},

			{ path: '', pathMatch: 'full', redirectTo: 'ordem-servicos' }
		]
	},
	{ path: '**', redirectTo: '' }
];
