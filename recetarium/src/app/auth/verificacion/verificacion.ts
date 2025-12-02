import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="verificacion-container">
      <h1>Verifica tu correo</h1>
      <p>Te hemos enviado un código de 4 dígitos a tu correo electrónico.</p>

      <form>
        <div class="form-group">
          <label for="codigo">Código</label>
          <input type="text" id="codigo" name="codigo" maxlength="4" placeholder="----" required>
        </div>

        <button type="submit">Confirmar</button>

        <p class="reenviar">
          ¿No recibiste el código?
          <a href="#">Reenviar código</a>
        </p>
      </form>
    </div>
  `,
  styleUrls: ['./verificacion.css']
})
export class VerificacionComponent {}
