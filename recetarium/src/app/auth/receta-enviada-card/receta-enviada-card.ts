import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-receta-enviada-card',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './receta-enviada-card.html',
  styleUrls: ['./receta-enviada-card.css']
})
export class RecetaEnviadaCardComponent {
  @Input() envio: any; // { id_envio, estado, fecha_envio, id_mis_receta, titulo, descripcion, imagen, remitente_nombre, ingredientes, pasos, categoria_nombre, ... }
  @Output() actualizar = new EventEmitter<number>();

  abierta = false;
  procesando = false;
  mensaje: string | null = null;

  toggleDetalles() {
    this.abierta = !this.abierta;
  }

  aceptar() {
    if (this.procesando) return;
    this.procesando = true;
    this.mensaje = null;
    this.http.post<any>(`${environment.apiUrl}/api/misrecetas/aceptar`, { id_envio: this.envio.id_envio }).subscribe({
      next: res => {
        this.procesando = false;
        this.mensaje = res?.mensaje || 'Receta aceptada';
        this.actualizar.emit(this.envio.id_envio);
      },
      error: err => {
        console.error(err);
        this.procesando = false;
        this.mensaje = err?.error?.error || 'Error al aceptar la receta';
      }
    });
  }

  rechazar() {
    if (this.procesando) return;
    if (!confirm('¿Seguro que deseas rechazar esta receta?')) return;
    this.procesando = true;
    this.mensaje = null;
    this.http.post<any>(`${environment.apiUrl}/api/misrecetas/rechazar`, { id_envio: this.envio.id_envio }).subscribe({
      next: res => {
        this.procesando = false;
        this.mensaje = res?.mensaje || 'Receta rechazada';
        this.actualizar.emit(this.envio.id_envio);
      },
      error: err => {
        console.error(err);
        this.procesando = false;
        this.mensaje = err?.error?.error || 'Error al rechazar la receta';
      }
    });
  }

  constructor(private http: HttpClient) {}
}
