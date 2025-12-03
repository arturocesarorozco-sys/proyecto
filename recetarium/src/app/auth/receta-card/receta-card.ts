import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './receta-card.html',
  styleUrls: ['./receta-card.css']
})
export class RecetaCardComponent implements OnInit {

  @Input() receta: any;

  detalles: any = null;
  abierta = false;
  cargando = false;

  comentarios: any[] = [];
  nuevoComentario = "";
  likes = 0;
  liked = false;

  idUsuario: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Solo acceder a localStorage si estamos en el navegador
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem("id_usuario");
      this.idUsuario = storedId ? Number(storedId) : null;
    }
  }

  toggleDetalles() {
    if (this.abierta) {
      this.abierta = false;
      return;
    }

    this.cargando = true;

    this.http.get(`${environment.apiUrl}/api/recetas/${this.receta.id_receta}`).subscribe({
      next: (data) => {
        this.detalles = data;
        this.abierta = true;
        this.cargarSocial();
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  // Carga comentarios y likes de la receta
  cargarSocial() {
    this.http.get<any>(`${environment.apiUrl}/api/recetas/${this.receta.id_receta}/social`)
      .subscribe(res => {
        this.comentarios = res.comentarios;
        this.likes = res.likes;

        // Ver si el usuario actual ya dio like
        if (this.idUsuario) {
          this.liked = res.comentarios.some((c: any) => c.id_usuario === this.idUsuario) ? true : this.liked;
        }
      });
  }

  // Publicar un nuevo comentario
  enviarComentario() {
    if (!this.nuevoComentario.trim() || !this.idUsuario) return;

    const body = {
      id_usuario: this.idUsuario,
      id_receta: this.receta.id_receta,
      comentario: this.nuevoComentario
    };

    this.http.post(`${environment.apiUrl}/api/recetas/comentar`, body)
      .subscribe((res: any) => {
        this.nuevoComentario = "";
        // Actualizar comentarios desde la respuesta del backend
        if (res.comentarios) {
          this.comentarios = res.comentarios;
        } else {
          this.cargarSocial();
        }
      });
  }

  // Dar o quitar like
  toggleLike() {
    if (!this.idUsuario) return;

    const body = {
      id_usuario: this.idUsuario,
      id_receta: this.receta.id_receta
    };

    this.http.post(`${environment.apiUrl}/api/recetas/like`, body)
      .subscribe((res: any) => {
        this.liked = res.liked;
        this.likes = res.likes; // Actualiza directamente el número de likes
      });
  }
}
