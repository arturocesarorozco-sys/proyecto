import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BubbleMenuComponent } from '../bubble-menu/bubble-menu';
import { MisRecetaCardComponent } from '../misreceta-card/misreceta-card';
import { EditarRecetaCardComponent } from '../editar-receta-card/editar-receta-card';

@Component({
  selector: 'app-misrecetas',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    BubbleMenuComponent,
    MisRecetaCardComponent,
    EditarRecetaCardComponent
  ],
  templateUrl: './misrecetas.html',
  styleUrls: ['./misrecetas.css']
})
export class MisRecetasComponent {
  recetasUsuario: any[] = [];       // recetas mostradas en la página
  recetasOriginales: any[] = [];    // todas las recetas completas
  recetaEditando: any = null;
  usuario: any = null;

  // --- filtros
  filtroNombre: string = '';
  filtroCategoria: string = '';
  filtroVegana: string = '';
  filtroVegetariana: string = '';

  categorias: Array<{ id: number, nombre: string }> = [
    { id: 1, nombre: 'Desayuno' },
    { id: 2, nombre: 'Comida' },
    { id: 3, nombre: 'Cena' }
  ];

  cargando: boolean = false;
  mensajeInfo: string | null = null;

  constructor(private http: HttpClient) {
    try {
      this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      this.usuario = null;
    }

    this.cargarCategoriasOpcionales();
    this.cargarMisRecetas();
  }

  private cargarCategoriasOpcionales() {
    this.http.get<any[]>('http://localhost:3000/api/categorias').subscribe({
      next: res => {
        if (Array.isArray(res) && res.length) {
          this.categorias = res.map(c => ({ id: c.id_categoria ?? c.id, nombre: c.nombre }));
        }
      },
      error: () => { /* usamos lista local si falla */ }
    });
  }

  cargarMisRecetas() {
    if (!this.usuario?.id_usuario) return;
    this.cargando = true;
    this.http.get<any[]>(`http://localhost:3000/api/misrecetas/mis/${this.usuario.id_usuario}`).subscribe({
      next: res => {
        this.recetasOriginales = res;       // guardamos todas las recetas completas
        this.recetasUsuario = [...res];     // inicializamos la lista visible
        this.cargando = false;
      },
      error: err => {
        console.error('Error cargando recetas del usuario', err);
        this.cargando = false;
      }
    });
  }

  // Filtrado local para mantener todos los detalles
  filtrar() {
    if (!this.recetasOriginales.length) return;
    this.cargando = true;

    let filtradas = [...this.recetasOriginales];

    if (this.filtroNombre?.trim()) {
      const nombreLower = this.filtroNombre.trim().toLowerCase();
      filtradas = filtradas.filter(r => r.titulo.toLowerCase().includes(nombreLower));
    }

    if (this.filtroCategoria) {
      filtradas = filtradas.filter(r => r.id_categoria == this.filtroCategoria);
    }

    if (this.filtroVegana !== '') {
      filtradas = filtradas.filter(r => String(r.es_vegana) === this.filtroVegana);
    }

    if (this.filtroVegetariana !== '') {
      filtradas = filtradas.filter(r => String(r.es_vegetariana) === this.filtroVegetariana);
    }

    this.recetasUsuario = filtradas;
    this.cargando = false;
  }

  resetFiltros() {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.filtroVegana = '';
    this.filtroVegetariana = '';
    this.recetasUsuario = [...this.recetasOriginales];
  }

  editarReceta(receta: any) {
    this.recetaEditando = { ...receta };
  }

  onRecetaActualizada(recetaActualizada: any) {
    const idx = this.recetasUsuario.findIndex(r => r.id_mis_receta === recetaActualizada.id_mis_receta);
    if (idx >= 0) {
      this.recetasUsuario[idx] = { ...this.recetasUsuario[idx], ...recetaActualizada };
    } else {
      this.cargarMisRecetas();
    }

    // También actualizamos la lista original para mantener coherencia
    const idxOrig = this.recetasOriginales.findIndex(r => r.id_mis_receta === recetaActualizada.id_mis_receta);
    if (idxOrig >= 0) {
      this.recetasOriginales[idxOrig] = { ...this.recetasOriginales[idxOrig], ...recetaActualizada };
    }

    this.recetaEditando = null;
  }

  cerrarEditor() {
    this.recetaEditando = null;
    this.cargarMisRecetas();
  }

  eliminarReceta(id: number) {
    if (!confirm('¿Seguro que deseas eliminar esta receta?')) return;
    this.http.delete(`http://localhost:3000/api/misrecetas/${id}`).subscribe({
      next: () => this.cargarMisRecetas(),
      error: err => console.error('Error eliminando receta', err)
    });
  }

  onEnviar(evento: any) {
    const correo = evento?.correo ?? '';
    const titulo = evento?.receta?.titulo ?? 'Receta';
    this.mensajeInfo = `Se envió "${titulo}" a ${correo}`;
    setTimeout(() => this.mensajeInfo = null, 3000);
  }
}
