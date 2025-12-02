// src/app/semana/semana.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces para tipado fuerte
export interface RecetaDetalle {
  id_detalle: number;
  id_mis_receta: number;
  titulo: string;
  imagen?: string;
  creado_en?: string;
}

export interface DiaSemana {
  Desayuno: RecetaDetalle | null;
  Comida: RecetaDetalle | null;
  Cena: RecetaDetalle | null;
}

export interface Semana {
  id_semana: number;
  fecha_inicio: string;
  fecha_fin: string;
  dias: Record<string, DiaSemana>; // Lunes, Martes, ...
}

export interface MisReceta {
  id_mis_receta: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
  categoria_nombre?: string;
  es_vegana?: boolean | number;
  es_vegetariana?: boolean | number;
  tiempo_preparacion?: number;
  porciones?: number;
  dificultad?: string;
  ingredientes?: any[];
  pasos?: any[];
}

@Injectable({ providedIn: 'root' })
export class SemanaService {
  private base = 'http://localhost:3000/api/semana';
  private baseRecetas = 'http://localhost:3000/api/misrecetas';

  constructor(private http: HttpClient) {}

  /** Obtener la semana del usuario */
  obtenerSemana(id_usuario: number): Observable<Semana> {
    return this.http.get<Semana>(`${this.base}/${id_usuario}`)
      .pipe(catchError(this.manejarError));
  }

  /** Obtener todas las recetas del usuario */
  obtenerMisRecetas(id_usuario: number): Observable<MisReceta[]> {
    return this.http.get<MisReceta[]>(`${this.baseRecetas}/usuario/${id_usuario}`)
      .pipe(catchError(this.manejarError));
  }

  /** Agregar una receta al calendario */
  agregarReceta(payload: { id_semana: number; id_mis_receta: number; dia: string; tipo_comida: string }): Observable<{ mensaje: string; detalle: any }> {
    return this.http.post<{ mensaje: string; detalle: any }>(
      `${this.base}/${payload.id_semana}/detalle`,
      payload
    ).pipe(catchError(this.manejarError));
  }

  /** Eliminar un detalle de receta */
  eliminarDetalle(id_detalle: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.base}/detalle/${id_detalle}`)
      .pipe(catchError(this.manejarError));
  }

  /** Manejo centralizado de errores */
  private manejarError(error: HttpErrorResponse) {
    let mensaje = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      mensaje = `Error de cliente: ${error.error.message}`;
    } else {
      mensaje = `Error ${error.status}: ${error.message}`;
      console.error('Error completo del backend:', error);
    }
    return throwError(() => new Error(mensaje));
  }
}
