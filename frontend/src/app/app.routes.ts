// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Páginas públicas
import { AuthComponent } from './auth/auth';

// Layout con navbar + outlet
import { LayoutComponent } from './layout/layout';

// Páginas dentro del layout (protegidas)
import { DashboardComponent } from './dashboard/dashboard';
import { MateriasComponent } from './materias/materias';
import { TutoriasComponent } from './tutorias/tutorias';
import { InscripcionesComponent } from './inscripciones/inscripciones';
import { AsistenciasComponent } from './asistencias/asistencias';
import { ObservacionesComponent } from './observaciones/observaciones';
import { AcercaDeComponent } from './acerca-de/acerca-de';

// Guard
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Redirección inicial
  { path: '', pathMatch: 'full', redirectTo: 'auth' },

  // Ruta pública (fuera del layout)
  { path: 'auth', component: AuthComponent },

  // Rutas protegidas dentro del layout (navbar + router-outlet hijo)
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'materias', component: MateriasComponent, canActivate: [authGuard] },
      { path: 'tutorias', component: TutoriasComponent, canActivate: [authGuard] },
      { path: 'inscripciones', component: InscripcionesComponent, canActivate: [authGuard] },
      { path: 'asistencias', component: AsistenciasComponent, canActivate: [authGuard] },
      { path: 'observaciones', component: ObservacionesComponent, canActivate: [authGuard] },
      { path: 'about', component: AcercaDeComponent, canActivate: [authGuard] },
    ],
  },

  // Cualquier otra ruta
  { path: '**', redirectTo: 'auth' }
];
