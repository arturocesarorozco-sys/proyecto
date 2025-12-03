import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnviarRecetaService {

  private apiUrl = `${environment.apiUrl}/recetas`; // TU BACKEND REAL

  constructor(private http: HttpClient) {}

  enviarReceta(idReceta: number, idUsuarioEnvia: number, idUsuarioRecibe: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, {
      idReceta,
      idUsuarioEnvia,
      idUsuarioRecibe
    });
  }

  // Obtener notificaciones del usuario
  obtenerNotificaciones(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/notificaciones/${idUsuario}`);
  }

  aceptarNotificacion(idNotificacion: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/aceptar/${idNotificacion}`, {});
  }

  rechazarNotificacion(idNotificacion: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rechazar/${idNotificacion}`, {});
  }
}
