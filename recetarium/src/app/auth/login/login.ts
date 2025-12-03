import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    if (!this.email || !this.password) {
      alert('Por favor ingresa tus datos');
      return;
    }

    this.loading = true;

    this.http
      .post<any>(`${environment.apiUrl}/api/usuarios/login`, {
        correo: this.email,
        contraseña: this.password
      })
      .subscribe({
        next: (res) => {
          alert(`Bienvenido, ${res.usuario.nombre} ✅`);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          this.router.navigate(['/main']);
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.error || 'Correo o contraseña incorrectos');
          this.loading = false;
        },
        complete: () => (this.loading = false)
      });
  }
}
