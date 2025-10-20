import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SectorService, Sector } from '../../../core/services/sector.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-sector-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sector-list.component.html',
  styleUrls: ['./sector-list.component.scss']
})

export class SectorListComponent implements OnInit {
  sectors: Sector[] = [];
  isLoading = false;
  userRole: string | null = null;

  // Modal
  showModal = false;
  sectorForm!: FormGroup;
  isSaving = false;
  editingSector: Sector | null = null;

  // Ícones disponíveis
  availableIcons: string[] = [
    'fa-building', 'fa-laptop-code', 'fa-comments', 'fa-headset',
    'fa-briefcase', 'fa-users', 'fa-cogs', 'fa-chart-line'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sectorService: SectorService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

//garante que não duplique o grid 
trackById(index: number, item: Sector): string {
  return item.id;
}
//garante que o icone não duplique e seja unico por card
trackByIcon(index: number, icon: string): string {
  return icon;
}

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    this.initForm();
    this.loadSectors();
  }

  /** Inicializa o formulário */
  initForm() {
    this.sectorForm = this.fb.group({
      nameSector: ['', Validators.required],
      description: [''],
      openingsHours: [''],
      icon: [''] // 👈 deixa vazio — evita sobrescrever ícones existentes
    });
  }

  /** Carrega todos os setores */
  loadSectors() {
    this.isLoading = true;
    this.sectorService.getAllSectors().subscribe({
      next: (res: any) => {
        this.sectors = Array.isArray(res.data) ? res.data : res;
        this.sectors = this.sectors.map(s => ({
          ...s,
          icon: s.icon && s.icon.trim() !== '' ? s.icon : 'fa-building'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar setores:', err);
        this.isLoading = false;
        this.toastr.error('Erro ao carregar setores', '❌ Falha');
      }
    });
  }

  /** Abre detalhes do setor */
  openSector(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  /** Abre o modal para criar ou editar setor */
  openModal(sector?: Sector) {
    this.showModal = true;

    if (sector) {
      // ✅ Modo edição
      this.editingSector = { ...sector };
      this.sectorForm.patchValue({
        nameSector: sector.nameSector,
        description: sector.description,
        openingsHours: sector.openingsHours,
        icon: sector.icon ?? 'fa-building'
      });
    } else {
      // ✅ Modo criação
      this.editingSector = null;
      this.sectorForm.reset({ icon: 'fa-building' });
    }
  }

  /** Fecha o modal */
  closeModal() {
    this.showModal = false;
    this.editingSector = null;
    this.sectorForm.reset({ icon: 'fa-building' });
  }

  /** Salva o setor (criação ou atualização) */
saveSector() {
  if (this.sectorForm.invalid) {
    this.sectorForm.markAllAsTouched();
    return;
  }

  // ✅ Garante que o ícone selecionado esteja atualizado no form
  const iconValue = this.sectorForm.value.icon || 'fa-building';
  this.sectorForm.patchValue({ icon: iconValue });

  const data = this.sectorForm.getRawValue();
  this.isSaving = true;

  if (this.editingSector && this.editingSector.id) {
    // Atualizar (PUT)
    const updated: Sector = { ...this.editingSector, ...data };

    this.sectorService.updateSector(updated).subscribe({
      next: (res: any) => {
        const updatedSector = res.data ?? updated;

        // Atualiza apenas o setor alterado
        const index = this.sectors.findIndex(s => s.id === updatedSector.id);
        if (index !== -1) {
          this.sectors[index] = { ...this.sectors[index], ...updatedSector };
        }

        this.toastr.success('Setor atualizado com sucesso!', '✅ Sucesso');
        this.closeModal();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Erro ao atualizar setor:', err);
        this.toastr.error('Erro ao atualizar setor!', '❌ Falha');
        this.isSaving = false;
      }
    });
  } else {
    // Criar (POST)
    this.sectorService.createSector(data).subscribe({
      next: (res: any) => {
        const newSector = res.data ?? data;
        this.sectors.push(newSector);
        this.toastr.success('Setor criado com sucesso!', '✅ Sucesso');
        this.closeModal();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Erro ao criar setor:', err);
        this.toastr.error('Erro ao criar setor!', '❌ Falha');
        this.isSaving = false;
      }
    });
  }
}
  /** Seleciona ícone visualmente */
  selectIcon(icon: string) {
    this.sectorForm.patchValue({ icon });
  }

  /** Verifica se o usuário pode editar setores */
  canEdit(): boolean {
    return ['master', 'admin'].includes(this.userRole?.toLowerCase() || '');
  }

  /** Verifica se o usuário pode criar setores */
  canCreate(): boolean {
    return this.userRole?.toLowerCase() === 'master';
  }
}
