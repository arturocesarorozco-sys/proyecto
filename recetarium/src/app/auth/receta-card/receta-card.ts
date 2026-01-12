import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.css']
})
export class RecetaCardComponent implements OnInit {

  @Input() receta: any;

  detalles: any = null;
  abierta = false;
  cargando = false;

  comentarios: any[] = [];
  nuevoComentario = '';
  likes = 0;
  liked = false;

  idUsuario: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {

      // 🔹 CASO 1: id_usuario directo
      const id = localStorage.getItem('id_usuario');
      if (id) {
        this.idUsuario = Number(id);
        return;
      }

      // 🔹 CASO 2: usuario completo guardado
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        try {
          const usuario = JSON.parse(usuarioStr);
          this.idUsuario = usuario.id_usuario ?? null;
        } catch {
          this.idUsuario = null;
        }
      }
    }
  }

  toggleDetalles() {
    if (this.abierta) {
      this.abierta = false;
      return;
    }

    this.cargando = true;

    this.http.get(`${environment.apiUrl}/api/recetas/${this.receta.id_receta}`)
      .subscribe({
        next: (data) => {
          this.detalles = data;
          this.abierta = true;
          this.cargarSocial();
          this.cargando = false;
        },
        error: () => this.cargando = false
      });
  }

  cargarSocial() {
    this.http.get<any>(`${environment.apiUrl}/api/recetas/${this.receta.id_receta}/social`)
      .subscribe(res => {
        this.comentarios = res.comentarios;
        this.likes = res.likes;
      });
  }

  enviarComentario() {
    if (!this.nuevoComentario.trim() || !this.idUsuario) {
      alert('Debes iniciar sesión');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/recetas/comentar`, {
      id_usuario: this.idUsuario,
      id_receta: this.receta.id_receta,
      comentario: this.nuevoComentario
    }).subscribe((res: any) => {
      this.nuevoComentario = '';
      this.comentarios = res.comentarios ?? this.comentarios;
    });
  }

  toggleLike() {
    if (!this.idUsuario) {
      alert('Debes iniciar sesión');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/recetas/like`, {
      id_usuario: this.idUsuario,
      id_receta: this.receta.id_receta
    }).subscribe((res: any) => {
      this.liked = res.liked;
      this.likes = res.likes;
    });
  }

  agregarAMisRecetas() {
    if (!this.idUsuario) {
      alert('Debes iniciar sesión');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/recetas/agregar-a-mis`, {
      id_usuario: this.idUsuario,
      id_receta: this.receta.id_receta
    }).subscribe(() => {
      alert('Receta agregada a tus recetas ❤️');
    });
  }
}
