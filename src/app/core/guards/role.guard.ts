import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data['roles'] as string[];

  // ✅ Usa o observable correto (currentUser$)
  const currentUser$ = authService.currentUser$ ?? of(null);

  return currentUser$.pipe(
    take(1),
    map((user: any) => {
      // 1️⃣ Verifica se o usuário está logado e se o token ainda é válido
      if (!user || authService.isTokenExpired()) {
        console.warn('⚠️ Nenhum usuário autenticado ou token expirado — redirecionando para login');

        if (authService.isTokenExpired()) {
          authService.logout();
        }

        return router.createUrlTree(['/login']);
      }

      // 2️⃣ Pega o papel (role) do usuário e compara com os esperados
      const userRole = user.role?.toUpperCase();
      const isAllowed = expectedRoles?.some(
        role => role.toUpperCase() === userRole
      );

      if (!isAllowed) {
        console.warn(
          `🔒 Acesso negado — Role do usuário: ${userRole}, Esperado: ${expectedRoles}`
        );
        return router.createUrlTree(['/dashboard']);
      }

      // 3️⃣ Tudo certo — acesso liberado
      console.log(`✅ Acesso permitido — Role: ${userRole}`);
      return true;
    })
  );
};
