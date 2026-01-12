import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BubbleMenuComponent } from '../../auth/bubble-menu/bubble-menu';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-lista-compras',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BubbleMenuComponent
  ],
  templateUrl: './lista-compras.html',
  styleUrls: ['./lista-compras.css']
})
export class ListaComprasComponent implements OnInit {

  lista: {
    nombre: string;
    cantidad: number;
    unidad: string;
    comprado: boolean;
  }[] = [];

  cargando = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generarLista();
  }

  /* ===============================
     USUARIO
     =============================== */
  getUsuario() {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return null;
    }
  }

  /* ===============================
     STORAGE KEY
     =============================== */
  private getStorageKey(idUsuario: number) {
    return `lista_compras_${idUsuario}`;
  }

  /* ===============================
     CARGAR ESTADO COMPRADO
     =============================== */
  private cargarEstadoComprado(idUsuario: number) {
    return JSON.parse(
      localStorage.getItem(this.getStorageKey(idUsuario)) || '{}'
    );
  }

  /* ===============================
     GUARDAR ESTADO COMPRADO
     =============================== */
  private guardarEstadoComprado(idUsuario: number) {
    const estado: any = {};
    this.lista.forEach(item => {
      estado[item.nombre] = item.comprado;
    });

    localStorage.setItem(
      this.getStorageKey(idUsuario),
      JSON.stringify(estado)
    );
  }

  /* ===============================
     GENERAR LISTA
     =============================== */
  generarLista() {
    const usuario = this.getUsuario();
    if (!usuario?.id_usuario) return;

    this.cargando = true;

    this.http.get<any[]>(
      `${environment.apiUrl}/api/lista-compras/generar/${usuario.id_usuario}`
    ).subscribe({
      next: res => {
        const estadoGuardado = this.cargarEstadoComprado(usuario.id_usuario);

        this.lista = res.map(item => ({
          ...item,
          comprado: estadoGuardado[item.nombre] || false
        }));

        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  /* ===============================
     CAMBIO CHECKBOX
     =============================== */
  onToggleComprado(usuarioId: number) {
    this.guardarEstadoComprado(usuarioId);
  }
}
