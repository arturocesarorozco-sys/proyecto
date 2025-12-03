import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegisterComponent {
  nombre = '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';

  private apiUrl = `${environment.apiUrl}/api/usuarios`; // URL de tu backend

  constructor(private http: HttpClient, private router: Router) {}

  registrarUsuario() {
    if (!this.nombre || !this.correo || !this.contrasena || !this.confirmarContrasena) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const nuevoUsuario = {
      nombre: this.nombre,
      correo: this.correo,
      contraseña: this.contrasena // esta propiedad se llama así porque tu backend la espera con “ñ”
    };

    this.http.post(this.apiUrl, nuevoUsuario).subscribe({
      next: (res: any) => {
        alert('Cuenta creada con éxito ✅');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 409) {
          alert('⚠️ El correo ya está registrado');
        } else {
          alert('❌ Error al crear la cuenta');
        }
        console.error(err);
      }
    });
  }
}
