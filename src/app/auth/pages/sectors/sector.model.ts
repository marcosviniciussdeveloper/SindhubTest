export interface Collaborator {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
}
export interface Sector {
  id: string;
  nameSector: string;
  description?: string;
  membersCount?: number;
  openingHours?: string; // ✅ igual ao JSON real
}