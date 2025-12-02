import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BubbleMenuComponent } from '../../auth/bubble-menu/bubble-menu';

@Component({
  selector: 'app-lista-compras',
  standalone: true,
  imports: [FormsModule, CommonModule, BubbleMenuComponent],
  templateUrl: './lista-compras.html',
  styleUrls: ['./lista-compras.css']
})
export class ListaComprasComponent {
  nuevoItem = '';
  lista: { nombre: string; comprado: boolean }[] = [];

  agregarItem() {
    if (this.nuevoItem.trim() !== '') {
      this.lista.push({ nombre: this.nuevoItem, comprado: false });
      this.nuevoItem = '';
    }
  }

  eliminarItem(index: number) {
    this.lista.splice(index, 1);
  }
}
