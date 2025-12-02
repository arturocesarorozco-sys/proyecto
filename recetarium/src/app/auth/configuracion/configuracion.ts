import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { BubbleMenuComponent } from '../../auth/bubble-menu/bubble-menu';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, BubbleMenuComponent],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  usuario: any = null;
  nombre = '';
  correo = '';
  imagenPerfil: string | ArrayBuffer | null = null;

  ngOnInit() {
    // Cargar usuario del localStorage
    const usuarioLS = localStorage.getItem('usuario');
    if (usuarioLS) {
      this.usuario = JSON.parse(usuarioLS);
      this.nombre = this.usuario.nombre;
      this.correo = this.usuario.correo;
      this.imagenPerfil = this.usuario.foto_perfil || null;
    }
  }

  cambiarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.imagenPerfil = reader.result);
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    if (!this.usuario) return;

    const datosActualizados = {
      nombre: this.nombre,
      correo: this.correo,
      foto_perfil: this.imagenPerfil
    };

    this.http.put(`http://localhost:3000/api/usuarios/${this.usuario.id_usuario}`, datosActualizados)
      .subscribe({
        next: (res: any) => {
          alert('✅ Cambios guardados correctamente');
          // Actualizar localStorage con los nuevos datos
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.error || '❌ Error al guardar los cambios');
        }
      });
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
