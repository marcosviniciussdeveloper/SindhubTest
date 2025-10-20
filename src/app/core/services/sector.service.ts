import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Modelos ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  sectorId?: string;
  positionName?: string;
  photoUrl?: string;
}

export interface Sector {
  id: string;
  nameSector: string;
  description?: string;
  openingsHours?: string;
  collaborators?: User[];

  // ⚙️ Ícone apenas visual (não persistido no backend)
  icon?: string;
}

// --- Serviço ---
@Injectable({ providedIn: 'root' })
export class SectorService {
  private readonly baseUrl = 'https://localhost:7172/api';

  constructor(private http: HttpClient) {}

  // --- Métodos para Setores ---

  /** (GET) Busca todos os setores. */
  getAllSectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.baseUrl}/Sector`);
  }

  /** (GET) Busca um setor específico por ID. */
  getSectorById(id: string): Observable<Sector> {
    return this.http.get<Sector>(`${this.baseUrl}/Sector/${id}`);
  }

  /** (POST) Cria um novo setor. */
  createSector(sector: Partial<Sector>): Observable<Sector> {
    // 🔹 Envia apenas dados que o backend espera (sem "icon")
    const payload = {
      nameSector: sector.nameSector,
      description: sector.description,
      openingsHours: sector.openingsHours
    };

    return this.http.post<Sector>(`${this.baseUrl}/Sector`, payload);
  }

  /** (PUT) Atualiza um setor existente. */
  updateSector(sector: Sector): Observable<void> {
    const payload = {
      nameSector: sector.nameSector,
      description: sector.description,
      openingsHours: sector.openingsHours,
      icon : sector.icon
    };

    return this.http.put<void>(`${this.baseUrl}/Sector/${sector.id}`, payload);
  }

  /** (DELETE) Remove um setor. */
  deleteSector(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Sector/${id}`);
  }

  // --- Métodos para Colaboradores e Cargos ---

  /** (GET) Busca colaboradores de um setor específico. */
  getCollaboratorsBySector(sectorId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/User/sector/${sectorId}`);
  }

  /** (GET) Busca todos os cargos (positions) disponíveis. */
  getPositions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Position`);
  }
}
