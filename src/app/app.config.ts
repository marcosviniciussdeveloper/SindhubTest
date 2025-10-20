// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor as JwtInterceptor } from './core/interceptors/jwt.interceptor';

// 🟢 Importações para Toastr
import { provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Configuração do HttpClient com interceptor JWT
    provideHttpClient(withInterceptors([JwtInterceptor])),

    // ✅ Adiciona suporte às animações (necessário para o ngx-toastr)
    importProvidersFrom(BrowserAnimationsModule),

    // ✅ Configuração global do ngx-toastr
    provideToastr({
      timeOut: 3000, // duração do toast
      positionClass: 'toast-top-right', // posição na tela
      closeButton: true, // botão de fechar
      progressBar: true, // barra de progresso
      newestOnTop: true, // novos toasts aparecem em cima
      preventDuplicates: true, // evita toasts repetidos
    }),
  ],
};
