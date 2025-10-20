import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('authToken');
  if (!token || authService.isTokenExpired()) {
    console.warn('🔒 Token ausente ou expirado — redirecionando para login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  console.log('✅ Token válido, rota liberada');
  return true;
};
