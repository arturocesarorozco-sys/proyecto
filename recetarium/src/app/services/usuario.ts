// src/app/services/usuario.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root', // ✅ Esto asegura que sea singleton
})
export class UsuarioService {
  private http = inject(HttpClient); // ✅ Nuevo método de Angular Standalone
  private apiUrl = `${environment.apiUrl}/usuarios`; // Cambia al endpoint de tu backend

  // Obtener datos de usuario por ID
  obtenerUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Actualizar datos de usuario
  actualizarUsuario(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datos);
  }
}
