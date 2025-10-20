// src/app/auth/pages/sectors/sector.router.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const sectorRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Master'] },
    loadComponent: () =>
      import('./sector-list.component').then(m => m.SectorListComponent),
  },

  
  
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./sector-detail.component').then(m => m.SectorDetailComponent),
  },
];
