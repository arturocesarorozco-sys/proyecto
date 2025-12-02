import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-olvido',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="olvido-container">
      <h1>Recuperar contraseña</h1>
      <p>Ingresa tu correo electrónico y te enviaremos un código de verificación.</p>

      <form>
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input type="email" id="email" name="email" placeholder="ejemplo@correo.com" required>
        </div>

        <button type="submit" routerLink="/verificacion">Enviar código</button>

        <p class="volver">
          <a routerLink="/login">Volver al inicio de sesión</a>
        </p>
      </form>
    </div>
  `,
  styleUrls: ['./olvido.css']
})
export class OlvidoComponent {}
