import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bubble-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bubble-menu.html',
  styleUrl: './bubble-menu.css'
})
export class BubbleMenuComponent {
  menuAbierto = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}
