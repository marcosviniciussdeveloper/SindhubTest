import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SectorService, Sector } from '../../../core/services/sector.service';
import { AuthService } from '../../../core/services/auth.service'; // 👈 Importado para pegar o usuário logado

@Component({
  standalone: true,
  selector: 'app-create-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  userForm!: FormGroup;
  userRole: string = '';
  sectors: Sector[] = [];
  regions: { id: string; nameRegion: string }[] = [];
  positions: { id: string; positionName: string; descriptionDuties: string }[] = [];
  selectedDuties: string | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  isSubmitting = false;
  private readonly apiUrl = 'https://localhost:7172/api';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sectorService: SectorService,
    private authService: AuthService // 👈 injeta o AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRegions();
    this.loadPositions();

    // 👇 pega dados do usuário logado
    const currentUser = this.authService.currentUserValue;
    this.userRole = currentUser?.role || '';

    // 🔹 Se for Master, pode escolher o setor (lista todos)
    if (this.userRole === 'Master') {
      this.loadSectors();
    }

    // 🔹 Se for Admin, vincula automaticamente ao setor dele
    if (this.userRole === 'Admin' && currentUser?.sectorId) {
      this.userForm.patchValue({ sectorId: currentUser.sectorId });
    }

    // 🔹 Se veio via rota (ex: /setores/:id/novo)
    const routeSectorId = this.route.snapshot.paramMap.get('id');
    if (routeSectorId) {
      this.userForm.patchValue({ sectorId: routeSectorId });
    }
  }

  // ==========================
  // 🔹 Inicializa o formulário
  // ==========================
  initForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      userName: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['Agent', Validators.required],
      sectorId: ['', Validators.required],
      regionId: ['', Validators.required],
      positionId: ['', Validators.required],
      photo: [null]
    });
  }

  // ==========================
  // 🔹 Carrega dados auxiliares
  // ==========================
  loadSectors() {
    this.sectorService.getAllSectors().subscribe({
      next: (res: any) => {
        this.sectors = Array.isArray(res.data) ? res.data : res;
      },
      error: (err) => console.error('Erro ao carregar setores:', err)
    });
  }

  loadRegions() {
    this.http.get<{ id: string; nameRegion: string }[]>(`${this.apiUrl}/Region`).subscribe({
      next: (res) => (this.regions = res),
      error: (err) => console.error('Erro ao carregar regiões:', err)
    });
  }

  loadPositions() {
    this.http
      .get<{ id: string; positionName: string; descriptionDuties: string }[]>(`${this.apiUrl}/Position`)
      .subscribe({
        next: (res) => (this.positions = res),
        error: (err) => console.error('Erro ao carregar cargos:', err)
      });
  }

  // ==========================
  // 🔹 Interações
  // ==========================
  onPositionChange(event: any) {
    const posId = event.target.value;
    const pos = this.positions.find((p) => p.id === posId);
    this.selectedDuties = pos ? pos.descriptionDuties : null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.userForm.patchValue({ photo: file });
      const reader = new FileReader();
      reader.onload = () => (this.selectedImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  // ==========================
  // 🔹 Submissão do formulário
  // ==========================
  submitForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    // Adiciona todos os campos no FormData
    Object.keys(this.userForm.controls).forEach((key) => {
      const value = this.userForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // 🔹 Se for Admin, força o sectorId do usuário logado
    const currentUser = this.authService.currentUserValue;
    if (this.userRole === 'Admin' && currentUser?.sectorId) {
      formData.set('sectorId', currentUser.sectorId);
    }

    this.http.post(`${this.apiUrl}/User`, formData).subscribe({
      next: () => {
        alert('✅ Usuário criado com sucesso!');
        this.router.navigate(['/setores']);
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        alert('❌ Erro ao criar usuário!');
        this.isSubmitting = false;
      }
    });
  }

  // 🔹 Voltar
  goToSectors(): void {
    this.router.navigate(['/setores']);
  }
}
