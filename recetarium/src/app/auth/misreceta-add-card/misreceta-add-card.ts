import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SemanaService, MisReceta } from '../semana/semana.service';

type TipoComida = 'Desayuno' | 'Comida' | 'Cena';

@Component({
  selector: 'app-misreceta-add-card',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './misreceta-add-card.html',
  styleUrls: ['./misreceta-add-card.css']
})
export class MisRecetaAddCardComponent {
  @Input() receta!: MisReceta;
  @Input() dia!: string;
  @Input() tipo_comida!: TipoComida;
  @Input() idSemana!: number;

  @Output() agregar = new EventEmitter<{ receta: MisReceta; dia: string; tipo_comida: TipoComida }>();

  abierta = false;
  cargando = false;
  detalles: any = null;

  constructor(private http: HttpClient, private semanaService: SemanaService) {}

  toggleDetalles() {
    this.abierta = !this.abierta;

    if (this.abierta && !this.detalles) {
      this.cargando = true;

      // Obtener detalles desde la API
      this.http.get<{ receta: MisReceta; ingredientes: any[]; pasos: any[] }>(
        `${environment.apiUrl}/api/misrecetas/${this.receta.id_mis_receta}`
      ).subscribe({
        next: (res) => {
          this.detalles = {
            ingredientes: res.ingredientes || [],
            pasos: res.pasos || []
          };
          this.cargando = false;
        },
        error: () => this.cargando = false
      });
    }
  }

  agregarAlCalendario() {
    this.agregar.emit({ receta: this.receta, dia: this.dia, tipo_comida: this.tipo_comida });
  }

  dietaLabel(): string {
    if (!this.receta) return '';
    if (this.receta.es_vegana) return 'Vegana';
    if (this.receta.es_vegetariana) return 'Vegetariana';
    return 'Normal';
  }

  dietaBadgeClass(): string {
    const label = this.dietaLabel();
    if (label === 'Vegana') return 'vegana';
    if (label === 'Vegetariana') return 'vegetariana';
    return 'normal';
  }
}
