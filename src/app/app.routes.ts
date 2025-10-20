import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/layout/layout.component').then(c => c.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
   
        path: 'dashboard',
        // ✅ CAMINHO CORRIGIDO AQUI
        loadComponent: () => import('./layout/pages/dashboard/dashboard.component')
          .then(c => c.DashboardComponent)
      },
      {
        path: 'setores',
        loadChildren: () =>
          import('./auth/pages/sectors/sector.router')
            .then(m => m.sectorRoutes),
      },
      // outras rotas internas aqui
    ],
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/pages/login/login').then(c => c.LoginComponent),
  },

  { path: '**', redirectTo: 'dashboard' },
];
