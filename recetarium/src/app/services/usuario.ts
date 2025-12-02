// src/app/services/usuario.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // ✅ Esto asegura que sea singleton
})
export class UsuarioService {
  private http = inject(HttpClient); // ✅ Nuevo método de Angular Standalone
  private apiUrl = 'http://localhost:3000/usuarios'; // Cambia al endpoint de tu backend

  // Obtener datos de usuario por ID
  obtenerUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Actualizar datos de usuario
  actualizarUsuario(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datos);
  }
}
