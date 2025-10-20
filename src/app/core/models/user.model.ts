export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'agent' | 'supervisor' | 'admin' | 'master';
  sectorId?: string;
  sectorName?: string;
  positionName?: string;
  photoPath?: string;
  status?: string;
  presenceStatus?: 'Online' | 'Offline' | 'Ausente';
  createdAt?: string;
}