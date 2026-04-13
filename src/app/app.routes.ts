import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
				loadComponent: () =>
					import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
			},
			{
				path: 'clientes',
				loadComponent: () =>
					import('./features/clientes/clientes.component').then((m) => m.ClientesComponent)
			},
			{
				path: 'funcionarios',
				loadComponent: () =>
					import('./features/funcionarios/funcionarios.component').then((m) => m.FuncionariosComponent)
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
				path: 'produtos',
				loadComponent: () =>
					import('./features/produtos/produtos.component').then((m) => m.ProdutosComponent)
			},
			{
				path: 'item-produtos',
				loadComponent: () =>
					import('./features/item-produtos/item-produtos.component').then((m) => m.ItemProdutosComponent)
			},
			{
				path: 'pagamentos',
				loadComponent: () =>
					import('./features/pagamentos/pagamentos.component').then((m) => m.PagamentosComponent)
			},
			{ path: '', pathMatch: 'full', redirectTo: 'dashboard' }
		]
	},
	{ path: '**', redirectTo: '' }
];
