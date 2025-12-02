import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { BubbleMenuComponent } from '../bubble-menu/bubble-menu';

@Component({
  selector: 'app-agregar-receta',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, BubbleMenuComponent],
  templateUrl: './agregar-receta.html',
  styleUrls: ['./agregar-receta.css']
})
export class AgregarRecetaComponent implements OnInit {
  receta = {
    titulo: '',
    descripcion: '',
    tiempo_preparacion: 0,
    porciones: 1,
    dificultad: 'Fácil',
    id_categoria: null,
    imagen: '',
    es_vegetariana: false,
    es_vegana: false,
    ingredientes: [] as any[],
    pasos: [] as any[]
  };

  ingredienteActual = { nombre: '', cantidad: '', unidad: '', tipo: '', unidad_base: '', nota: '', id_ingrediente: null };
  pasoActual = { descripcion: '' };

  categorias = [
    { id: 1, nombre: 'Desayuno' },
    { id: 2, nombre: 'Comida' },
    { id: 3, nombre: 'Cena' }
  ];

  sugerencias: any[] = [];
  showSugerencias = false;

  usuarioLogeadoId = 2; // ejemplo: cambiar por tu lógica de login

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  buscarIngrediente() {
    if (!this.ingredienteActual.nombre.trim()) {
      this.sugerencias = [];
      return;
    }

    this.http.get<any[]>(`http://localhost:3000/api/agregarrecetas/ingredientes/buscar?q=${this.ingredienteActual.nombre}`)
      .subscribe(res => {
        this.sugerencias = res;
        this.showSugerencias = res.length > 0;
      });
  }

  seleccionarSugerencia(ing: any) {
    this.ingredienteActual.nombre = ing.nombre;
    this.ingredienteActual.id_ingrediente = ing.id_ingrediente;
    this.ingredienteActual.tipo = ing.tipo;
    this.ingredienteActual.unidad_base = ing.unidad_base;
    this.showSugerencias = false;
  }

  agregarIngrediente() {
    if (!this.ingredienteActual.nombre.trim()) return alert('Agrega un nombre al ingrediente');
    this.receta.ingredientes.push({ ...this.ingredienteActual });
    this.ingredienteActual = { nombre: '', cantidad: '', unidad: '', tipo: '', unidad_base: '', nota: '', id_ingrediente: null };
  }

  eliminarIngrediente(idx: number) {
    this.receta.ingredientes.splice(idx, 1);
  }

  agregarPaso() {
    if (!this.pasoActual.descripcion.trim()) return alert('Agrega la descripción del paso');
    this.receta.pasos.push({ ...this.pasoActual });
    this.pasoActual = { descripcion: '' };
  }

  eliminarPaso(idx: number) {
    this.receta.pasos.splice(idx, 1);
  }

  guardarReceta() {
    if (!this.receta.titulo || !this.receta.descripcion) return alert('Título y descripción son obligatorios');

    const payload = { ...this.receta, id_usuario: this.usuarioLogeadoId };
    this.http.post('http://localhost:3000/api/agregarrecetas', payload).subscribe({
      next: (res: any) => {
        alert(`Receta "${this.receta.titulo}" creada exitosamente 🎉`);
        this.limpiarFormulario();
      },
      error: err => {
        console.error(err);
        alert('Error al crear la receta');
      }
    });
  }

  limpiarFormulario() {
    this.receta = {
      titulo: '',
      descripcion: '',
      tiempo_preparacion: 0,
      porciones: 1,
      dificultad: 'Fácil',
      id_categoria: null,
      imagen: '',
      es_vegetariana: false,
      es_vegana: false,
      ingredientes: [],
      pasos: []
    };
    this.ingredienteActual = { nombre: '', cantidad: '', unidad: '', tipo: '', unidad_base: '', nota: '', id_ingrediente: null };
    this.pasoActual = { descripcion: '' };
    this.sugerencias = [];
  }
}
