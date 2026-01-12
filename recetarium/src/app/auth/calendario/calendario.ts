import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MisRecetaCardComponent } from '../misreceta-card/misreceta-card';
import { BubbleMenuComponent } from '../../auth/bubble-menu/bubble-menu';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MisRecetaCardComponent,
    BubbleMenuComponent
  ],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {

  diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  tiposComida = ['desayuno','comida','cena'];

  calendario: any = {};
  recetas: any[] = [];

  cargando = false;
  mostrarModal = false;

  seleccionado: { dia: string; tipo: string } | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.inicializarCalendario();
    this.cargarMisRecetas();
    this.cargarCalendario();
  }

  /* ===================== */
  /* UTILIDADES */
  /* ===================== */
  getUsuario() {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return null;
    }
  }

  inicializarCalendario() {
    this.calendario = {};
    this.diasSemana.forEach(dia => {
      this.calendario[dia] = {
        desayuno: null,
        comida: null,
        cena: null
      };
    });
  }

  /* ===================== */
  /* CARGAR DATOS */
  /* ===================== */
  cargarMisRecetas() {
    const usuario = this.getUsuario();
    if (!usuario?.id_usuario) return;

    this.cargando = true;

    this.http.get<any[]>(
      `${environment.apiUrl}/api/misrecetas/mis/${usuario.id_usuario}`
    ).subscribe({
      next: res => {
        this.recetas = res || [];
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  cargarCalendario() {
    const usuario = this.getUsuario();
    if (!usuario?.id_usuario) return;

    this.http.get<any[]>(
      `${environment.apiUrl}/api/calendario/${usuario.id_usuario}`
    ).subscribe({
      next: res => {
        this.inicializarCalendario();

        res.forEach(item => {
          const diaNombre = this.diasSemana[item.dia - 1];
          this.calendario[diaNombre][item.tipo_comida] = item;
        });
      },
      error: err => console.error(err)
    });
  }

  /* ===================== */
  /* MODAL */
  /* ===================== */
  abrirModal(dia: string, tipo: string) {
    this.seleccionado = { dia, tipo };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.seleccionado = null;
  }

  /* ===================== */
  /* ASIGNAR / ELIMINAR */
  /* ===================== */
  asignarReceta(receta: any) {
    if (!this.seleccionado) return;

    const usuario = this.getUsuario();
    if (!usuario?.id_usuario) return;

    const payload = {
      id_usuario: usuario.id_usuario,
      dia: this.diasSemana.indexOf(this.seleccionado.dia) + 1,
      tipo_comida: this.seleccionado.tipo,
      id_mis_receta: receta.id_mis_receta
    };

    this.http.post(
      `${environment.apiUrl}/api/calendario/asignar`,
      payload
    ).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarCalendario();
      },
      error: err => console.error(err)
    });
  }

  eliminarReceta(dia: string, tipo: string) {
    const usuario = this.getUsuario();
    if (!usuario?.id_usuario) return;

    const payload = {
      id_usuario: usuario.id_usuario,
      dia: this.diasSemana.indexOf(dia) + 1,
      tipo_comida: tipo
    };

    this.http.post(
      `${environment.apiUrl}/api/calendario/eliminar`,
      payload
    ).subscribe({
      next: () => this.cargarCalendario(),
      error: err => console.error(err)
    });
  }
}
