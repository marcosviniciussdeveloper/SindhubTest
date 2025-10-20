import { Component, importProvidersFrom, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../enviroments/environment';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  userRole: string = '';
  showQuickTicket = false;
  quickTicketForm!: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  users: any[] = [];

private readonly apiUrl = environment.apiUrl;


  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userRole = user?.role || '';
    this.initQuickTicketForm();
    this.loadUsers();
  }

  // ==============================
  // 🔹 CONTROLES DE ROLE
  // ==============================
  isMaster(): boolean { return this.userRole === 'Master'; }
  isAdmin(): boolean { return this.userRole === 'Admin'; }
  isSupervisor(): boolean { return this.userRole === 'Supervisor'; }
  isAgent(): boolean { return this.userRole === 'Agent'; }

  canOpenTicket(): boolean {
    return this.isAgent() || this.isSupervisor() || this.isAdmin() || this.isMaster();
  }

  canEditTicket(): boolean {
    return this.isAgent() || this.isSupervisor() || this.isAdmin() || this.isMaster();
  }

  canTransferTicket(): boolean {
    return this.isSupervisor() || this.isAdmin() || this.isMaster() || this.isAgent();
  }

  canCloseTicket(): boolean {
    return this.isAgent() || this.isSupervisor() || this.isAdmin() || this.isMaster();
  }

  canViewSector(sector: any): boolean {
    return this.isMaster() || this.isAdmin() || this.isSupervisor() || this.isAgent();
  }

  canViewAllSectors(): boolean {
    return this.isMaster();
  }

  // ==============================
  // 🔹 FORMULÁRIO DE TICKET RÁPIDO
  // ==============================

  initQuickTicketForm(): void {
    this.quickTicketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['', Validators.required],
      assignedTo: ['', Validators.required]
    });
  }

  openQuickTicket(): void {
    this.showQuickTicket = true;
  }

  closeQuickTicket(): void {
    this.showQuickTicket = false;
    this.quickTicketForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Carrega usuários para o campo "Responsável / Grupo"
  loadUsers(): void {
    this.http.get<any[]>(`${this.apiUrl}/User`).subscribe({
      next: (res: any) => {
        this.users = res.data || res; // compatível com {data: [...]} ou array direto
      },
      error: (err) => console.error('Erro ao carregar usuários:', err)
    });
  }

  // ==============================
  // 🔹 ENVIO DO FORMULÁRIO
  // ==============================

  submitQuickTicket(): void {
    if (this.quickTicketForm.invalid) return;

    this.isSubmitting = true;

    const formData = new FormData();
    Object.entries(this.quickTicketForm.value).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile);
    }

    // Você pode associar o ID do usuário logado ao ticket:
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.id) {
      formData.append('createdBy', currentUser.id);
    }

    this.http.post(`${this.apiUrl}/Ticket/quick`, formData).subscribe({
      next: () => {
        alert('✅ Ticket criado com sucesso!');
        this.closeQuickTicket();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erro ao criar ticket:', err);
        alert('❌ Erro ao criar ticket.');
        this.isSubmitting = false;
      }
    });
  }
}
