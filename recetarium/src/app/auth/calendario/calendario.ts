import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MisRecetaAddCardComponent } from '../misreceta-add-card/misreceta-add-card';
import { BubbleMenuComponent } from '../bubble-menu/bubble-menu';

interface RecetaDetalle {
  id_detalle: number;
  id_mis_receta: number;
  titulo: string;
  imagen?: string;
  creado_en?: string;
}

type TipoComida = 'Desayuno' | 'Comida' | 'Cena';

interface DiaSemana {
  Desayuno: RecetaDetalle | null;
  Comida: RecetaDetalle | null;
  Cena: RecetaDetalle | null;
}

interface Semana {
  id_semana: number;
  fecha_inicio: string;
  fecha_fin: string;
  dias: Record<string, DiaSemana>;
}

interface MisReceta {
  id_mis_receta: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
  categoria_nombre?: string;
  es_vegana?: boolean;
  es_vegetariana?: boolean;
  tiempo_preparacion?: number;
  porciones?: number;
  dificultad?: string;
  ingredientes?: any[];
  pasos?: any[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MisRecetaAddCardComponent, BubbleMenuComponent],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {
  id_usuario = 1;
  semana: Semana | null = null;
  diasOrden = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  comidas: TipoComida[] = ['Desayuno','Comida','Cena'];

  misRecetas: MisReceta[] = [];

  id_semana = 0;

  baseSemana = '/api/semana';
  baseRecetas = '/api/misrecetas';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const u = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (u && u.id_usuario) this.id_usuario = u.id_usuario;

    this.cargarSemana();
    this.cargarMisRecetas();
  }

  cargarSemana() {
    this.http.get<any[]>(`${this.baseSemana}/usuario/${this.id_usuario}`)
      .subscribe({
        next: (res) => {
          if (!res.length) return;
          const sem = res[0];
          this.semana = {
            id_semana: sem.id_semana,
            fecha_inicio: sem.fecha_inicio,
            fecha_fin: sem.fecha_fin,
            dias: {}
          };
          this.diasOrden.forEach(d => {
            this.semana!.dias[d] = { Desayuno: null, Comida: null, Cena: null };
          });
          if (sem.detalle) {
            for (const det of sem.detalle) {
              const dia = det.dia;
              const tipo = det.tipo_comida as TipoComida;
              if (this.semana.dias[dia]) {
                this.semana.dias[dia][tipo] = det;
              }
            }
          }
          this.id_semana = sem.id_semana;
        },
        error: err => console.error(err)
      });
  }

  cargarMisRecetas() {
    this.http.get<MisReceta[]>(`${this.baseRecetas}/usuario/${this.id_usuario}`)
      .subscribe({
        next: res => this.misRecetas = res,
        error: err => console.error(err)
      });
  }

  agregarRecetaAlCalendario(receta: MisReceta, dia: string, tipo_comida: TipoComida) {
    const payload = {
      id_semana: this.id_semana,
      id_mis_receta: receta.id_mis_receta,
      dia,
      tipo_comida
    };
    this.http.post(`${this.baseSemana}/agregar`, payload).subscribe({
      next: () => this.cargarSemana(),
      error: err => console.error(err)
    });
  }

  eliminarDetalle(detalle: RecetaDetalle, dia: string, tipo_comida: TipoComida) {
    if (!detalle.id_detalle) return;
    if (!confirm('¿Eliminar esta receta del calendario?')) return;

    this.http.delete(`${this.baseSemana}/eliminar/${detalle.id_detalle}`).subscribe({
      next: () => this.cargarSemana(),
      error: err => console.error(err)
    });
  }

  getReceta(dia: string, comida: TipoComida) {
    return this.semana?.dias[dia]?.[comida] || null;
  }
}
