import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RecetaEnviadaCardComponent } from '../receta-enviada-card/receta-enviada-card';
import { BubbleMenuComponent } from '../bubble-menu/bubble-menu';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-recibidas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RecetaEnviadaCardComponent, BubbleMenuComponent],
  templateUrl: './recibidas.html',
  styleUrls: ['./recibidas.css']
})
export class RecibidasComponent {
  recibidas: any[] = [];
  usuarioActual: any = {};

  cargando = false;
  mensajeError: string | null = null;

  constructor(private http: HttpClient) {
    try { this.usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { this.usuarioActual = {}; }
    this.cargarRecibidas();
  }

  cargarRecibidas() {
    if (!this.usuarioActual?.id_usuario) return;
    this.cargando = true;
    this.mensajeError = null;

    this.http.get<any[]>(`${environment.apiUrl}/api/misrecetas/recibidas/${this.usuarioActual.id_usuario}`).subscribe({
      next: res => { this.recibidas = res || []; this.cargando = false; },
      error: err => { console.error(err); this.mensajeError = 'Error al cargar recetas recibidas'; this.cargando = false; }
    });
  }

  eliminarEnvioLocal(id_envio: number) {
    // quitar de la lista local cuando se acepta o se rechaza
    this.recibidas = this.recibidas.filter(r => r.id_envio !== id_envio);
  }
}
