import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BubbleMenuComponent } from '../../auth/bubble-menu/bubble-menu';
import { RecetaCardComponent } from '../../auth/receta-card/receta-card';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, BubbleMenuComponent, RecetaCardComponent],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.css']
})
export class RecetasComponent {
  recetas: any[] = [];

  filtros = {
    categoria: '',
    es_vegetariana: false,
    es_vegana: false,
    search: ''
  };

  constructor(private http: HttpClient) {
    this.cargarRecetas();
  }

  cargarRecetas() {
    // 🌱 Lógica mejorada: si Vegana está marcada, forzamos vegetariana = false
    if (this.filtros.es_vegana) this.filtros.es_vegetariana = false;

    const params: any = {};
    if (this.filtros.categoria) params.categoria = this.filtros.categoria;
    if (this.filtros.es_vegetariana) params.es_vegetariana = '1';
    if (this.filtros.es_vegana) params.es_vegana = '1';
    if (this.filtros.search) params.search = this.filtros.search.trim();

    const query = new URLSearchParams(params).toString();
    const url = `${environment.apiUrl}/api/recetas${query ? '?' + query : ''}`;

    this.http.get<any[]>(url).subscribe({
      next: res => this.recetas = res,
      error: err => console.error('Error al cargar recetas', err)
    });
  }

  limpiarFiltros() {
    this.filtros = { categoria: '', es_vegetariana: false, es_vegana: false, search: '' };
    this.cargarRecetas();
  }
}
