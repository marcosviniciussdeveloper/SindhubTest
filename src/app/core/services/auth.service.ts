import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ✅ Interface para o usuário autenticado
export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: 'agent' | 'supervisor' | 'admin' | 'master';
  sectorId?: string;
  photoPath?: string;
  positionName?: string; // ✅ adiciona aqui
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  [x: string]: any;
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser$: Observable<AuthUser | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /** Retorna o usuário atual */
  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /** Retorna apenas o token JWT */
  get authToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /** ✅ Retorna o papel (role) do usuário */
  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  /** ✅ Retorna o ID do setor do usuário */
  getUserSectorId(): string | null {
    return this.currentUserValue?.sectorId || null;
  }

  /** ✅ Retorna o nome completo do usuário */
  getUserName(): string | null {
    return this.currentUserValue?.name || null;
  }

  /** ✅ Retorna o caminho da foto do usuário */
  getUserPhoto(): string | null {
    return this.currentUserValue?.photoPath || '/assets/default-user.png';
  }

  /** ✅ Verifica se o token está expirado */
  isTokenExpired(): boolean {
    const token = this.authToken;
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return now > exp;
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  }

  /** ✅ Realiza login e guarda informações completas do usuário */
  login(username: string, password: string) {
    return this.http
      .post<any>('https://localhost:7172/api/Auth/login', { username, password })
      .pipe(
        map((response) => {
          if (response && response.token) {
            const token = response.token;
            localStorage.setItem('authToken', token);

            // Decodifica o payload do token JWT
            const payload = JSON.parse(atob(token.split('.')[1]));

            const user: AuthUser = {
              id: payload.sub,
              name: payload.unique_name || payload.name,
              email: payload.email || payload.Email,
              role:
                payload.role ||
                payload.Role ||
                payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
              sectorId:
                payload.sectorId ||
                payload.SectorId ||
              
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sectorid'],
               positionName:
  payload.positionName ||
  payload.PositionName ||
  payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/positionname'] ||
  null,
              photoPath:
                payload.photoPath ||
                payload.PhotoPath ||
                '/assets/default-user.png',
              token: token,
            };

            // Armazena no localStorage e atualiza o BehaviorSubject
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          return response;
        })
      );
  }

  /** ✅ Logout e limpeza local */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
