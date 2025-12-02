import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-editar-receta-card',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './editar-receta-card.html',
  styleUrls: ['./editar-receta-card.css']
})
export class EditarRecetaCardComponent {
  @Input() receta: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() recetaActualizada = new EventEmitter<any>(); // <- nuevo

  constructor(private http: HttpClient) {}

  guardarCambios() {
    // Llamada al backend de mis_recetas
    this.http.put(`http://localhost:3000/api/misrecetas/${this.receta.id_mis_receta}`, this.receta).subscribe({
      next: () => {
        alert('Receta actualizada correctamente');
        // Emitimos la receta actualizada para que el padre recargue
        this.recetaActualizada.emit(this.receta);
        this.cerrar.emit();
      },
      error: err => console.error('Error al actualizar receta', err)
    });
  }

  cancelar() {
    this.cerrar.emit();
  }

  agregarPaso() {
    if (!this.receta.pasos) this.receta.pasos = [];
    this.receta.pasos.push({ numero_paso: this.receta.pasos.length + 1, descripcion: '' });
  }

  eliminarPaso(index: number) {
    this.receta.pasos.splice(index, 1);
    // Reajustamos el número de paso
    this.receta.pasos.forEach((p: any, i: number) => p.numero_paso = i + 1);
  }
}
