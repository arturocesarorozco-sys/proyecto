import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-misreceta-card',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './misreceta-card.html',
  styleUrls: ['./misreceta-card.css']
})
export class MisRecetaCardComponent {
  @Input() receta: any;
  @Output() editar = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<number>();
  @Output() enviar = new EventEmitter<any>();

  abierta = false;
  cargando = false;
  detalles: any = null;

  showEnviarPopup = false;
  correoDestino = '';
  enviando = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  usuarioActual: any = {};

  constructor(private http: HttpClient) {
    try {
      this.usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      this.usuarioActual = {};
    }
  }

  // Devuelve la etiqueta de dieta: "Vegana", "Vegetariana" o "Normal"
  dietaLabel(): string {
    if (!this.receta) return '';
    const vegana = this.receta.es_vegana === 1 || this.receta.es_vegana === true || this.receta.es_vegana === '1';
    const vegetariana = this.receta.es_vegetariana === 1 || this.receta.es_vegetariana === true || this.receta.es_vegetariana === '1';

    if (vegana) return 'Vegana';
    if (vegetariana) return 'Vegetariana';
    return 'Normal';
  }

  // Retorna una clase CSS según el tipo de dieta
  dietaBadgeClass(): string {
    const label = this.dietaLabel();
    if (label === 'Vegana') return 'vegana';
    if (label === 'Vegetariana') return 'vegetariana';
    return 'normal';
  }

  toggleDetalles() {
    this.abierta = !this.abierta;

    if (this.abierta && !this.detalles) {
      this.cargando = true;

      // Siempre asegura que ingredientes y pasos existan
      this.detalles = {
        ingredientes: this.receta.ingredientes || [],
        pasos: this.receta.pasos || []
      };

      setTimeout(() => this.cargando = false, 300);
    }
  }

  abrirEditor() {
    this.editar.emit(this.receta);
  }

  eliminarReceta() {
    this.eliminar.emit(this.receta.id_mis_receta);
  }

  enviarReceta() {
    this.mensajeError = null;
    this.mensajeExito = null;
    this.correoDestino = '';
    this.showEnviarPopup = true;
  }

  async confirmarEnvio() {
    if (!this.correoDestino || !this.correoDestino.includes('@')) {
      this.mensajeError = 'Introduce un correo válido';
      return;
    }

    if (!this.usuarioActual?.id_usuario) {
      this.mensajeError = 'No se encontró el usuario remitente.';
      return;
    }

    this.enviando = true;

    const payload = {
      id_remitente: this.usuarioActual.id_usuario,
      id_mis_receta: this.receta.id_mis_receta,
      correo_destino: this.correoDestino
    };

    this.http.post<any>('http://localhost:3000/api/misrecetas/enviar-correo', payload).subscribe({
      next: (res) => {
        this.enviando = false;
        this.mensajeExito = res?.mensaje || 'Receta enviada correctamente';

        this.enviar.emit({
          id_envio: res?.id_envio,
          receta: this.receta,
          correo: this.correoDestino
        });

        setTimeout(() => this.showEnviarPopup = false, 1400);
      },
      error: (err) => {
        console.error('Error enviando receta', err);
        this.enviando = false;
        this.mensajeError = err?.error?.error || 'No se pudo enviar la receta.';
      }
    });
  }

  cancelarEnvio() {
    this.showEnviarPopup = false;
    this.mensajeError = null;
    this.mensajeExito = null;
    this.correoDestino = '';
  }
}
