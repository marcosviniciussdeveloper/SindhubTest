// src/app/auth/pages/login/login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false; // Estado de carregamento

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
 

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.errorMessage = null;
    this.isLoading = true; // Ativa o spinner

    // --- CORREÇÃO DO ESPAÇO EM BRANCO ---

    // 1. Pega os valores "crus"
    const rawUserName = this.loginForm.value.userName;
    const rawPassword = this.loginForm.value.password;

    // 2. Limpa os espaços (aqui está o .trim())
    const userName = rawUserName ? rawUserName.trim() : '';
    const password = rawPassword ? rawPassword.trim() : ''; // Limpa a senha também

    // --- FIM DA CORREÇÃO ---

    // 3. Envia os dados limpos para o serviço
    this.authService.login(userName, password).subscribe({
      next: (response) => {
        this.isLoading = false; // Encerra o spinner
        this.router.navigate(['/']); // Navega para o dashboard
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.errorMessage = 'Usuário ou senha inválidos.';
        this.isLoading = false; // Encerra o spinner mesmo em erro
      }
    });
  }
}