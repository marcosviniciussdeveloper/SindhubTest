import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private supabase: SupabaseClient;

  // Inicializa o cliente Supabase com a URL e a chave pública
  constructor() {
    this.supabase = createClient(
      "https://mdyhrwmjefcmafdvilni.supabase.co" ,
             "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keWhyd21qZWZjbWFmZHZpbG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTc3MTcsImV4cCI6MjA3NjM3MzcxN30.rIIpEZSvNZH9gqBHI2qDJTvrBs3QGArg_NRJnF6f7uk"
        );
  }

  async uploadUserPhoto(file: File, userName: string): Promise<string | null> {
    const filePath = `users/${userName}/${file.name}`;
    const { error } = await this.supabase.storage
      .from('SindHub') // nome do bucket configurado no Supabase
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = this.supabase.storage
      .from('SindHub')
      .getPublicUrl(filePath);

    return data?.publicUrl ?? null;
  }
}
