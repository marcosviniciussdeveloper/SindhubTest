// src/app/core/models/auth-response.model.ts
import { User } from './user.model';

export interface AuthResponse {
  token: string;
  user: User; 
}