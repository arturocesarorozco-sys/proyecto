import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { VerificacionComponent } from './auth/verificacion/verificacion';
import { OlvidoComponent } from './auth/olvido/olvido';
import { RegisterComponent } from './auth/registro/registro';
import { MainComponent } from './auth/main/main';
import { RecetasComponent } from './auth/recetas/recetas';
import { MisRecetasComponent } from './auth/misrecetas/misrecetas';
import { CalendarioComponent } from './auth/calendario/calendario';
import { AgregarRecetaComponent } from './auth/agregar-receta/agregar-receta';
import { ListaComprasComponent } from './auth/lista-compras/lista-compras';
import { RecibidasComponent } from './auth/recibidas/recibidas';
import { ConfiguracionComponent } from './auth/configuracion/configuracion';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'olvido', component: OlvidoComponent },
  { path: 'verificacion', component: VerificacionComponent },
  { path: 'main', component: MainComponent },
  { path: 'recetas', component: RecetasComponent},
  { path: 'misrecetas', component: MisRecetasComponent },
  { path: 'calendario', component: CalendarioComponent },
  { path: 'agregar-receta', component: AgregarRecetaComponent },
  { path: 'lista-compras', component: ListaComprasComponent },
  { path: 'recibidas', component: RecibidasComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
];
