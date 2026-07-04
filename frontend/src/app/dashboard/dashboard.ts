import { Component, Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ShortTextPipe } from '../pipes/short-text.pipe';
import { FullNamePipe } from '../pipes/full-name.pipe';

import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { User } from '../models/user.model';

@Component({
  selector: 'tc-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ShortTextPipe, FullNamePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  user!: Signal<User | null>;

  // Tarjetas para tutor/admin
  tarjetasTutor = [
    {
      titulo: 'Materias',
      desc: 'Gestiona el catálogo de materias (crear, editar, eliminar).',
      img: '/Materias.png',
      link: '/materias',
      btn: 'Ir a Materias',
    },
    {
      titulo: 'Tutorías',
      desc: 'Crea y administra las tutorías disponibles por materia y tutor.',
      img: '/tutorias.png',
      link: '/tutorias',
      btn: 'Ir a Tutorías',
    },
    {
      titulo: 'Inscripciones',
      desc: 'Revisa qué estudiantes se han inscrito en tus tutorías.',
      img: '/inscripciones.png',
      link: '/inscripciones',
      btn: 'Ver inscripciones',
    },
    {
      titulo: 'Asistencias',
      desc: 'Registra la asistencia por sesión para control académico.',
      img: '/Asistencia.png',
      link: '/asistencias',
      btn: 'Ir a Asistencias',
    },
    {
      titulo: 'Observaciones',
      desc: 'Lleva observaciones académicas por sesión para cada estudiante.',
      img: '/Observaciones-academicas.png',
      link: '/observaciones',
      btn: 'Ir a Observaciones',
    },
  ];

  // Tarjetas para estudiante
  tarjetasEstudiante = [
    {
      titulo: 'Explorar tutorías',
      desc: 'Encuentra tutorías disponibles según tu semestre y necesidades.',
      img: '/tutorias.png',
      link: '/tutorias',
      btn: 'Ver tutorías',
    },
    {
      titulo: 'Mis inscripciones',
      desc: 'Revisa en qué tutorías estás inscrito actualmente.',
      img: '/inscripciones.png',
      link: '/inscripciones',
      btn: 'Ver inscripciones',
    },
    {
      titulo: 'Mi asistencia',
      desc: 'Consulta tu historial de asistencia a las distintas sesiones.',
      img: '/Asistencia.png',
      link: '/asistencias',
      btn: 'Ver asistencia',
    },
    {
      titulo: 'Observaciones',
      desc: 'Lee las observaciones académicas que tus tutores han registrado.',
      img: '/Observaciones-academicas.png',
      link: '/observaciones',
      btn: 'Ver observaciones',
    },
  ];

  // tarjetas calculadas a partir de la respuesta del backend
  statsCards: { label: string; valor: string | number }[] = [];

  constructor(
    private auth: AuthService,
    private dashSvc: DashboardService
  ) {
    this.user = this.auth.currentUser;
  }

  ngOnInit(): void {
    this.dashSvc.loadStats();
  }

  // Helpers de rol
  get rol(): string | null {
    return this.user()?.role ?? null;
  }

  get esEstudiante(): boolean {
    return this.rol === 'STUDENT';
  }

  get esTutor(): boolean {
    return this.rol === 'TUTOR';
  }

  get esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  get rolTexto(): string {
    if (this.esEstudiante) return 'Estudiante';
    if (this.esTutor) return 'Tutor';
    if (this.esAdmin) return 'Administrador';
    return 'Usuario';
  }

  // Tarjetas de navegación según rol
  get tarjetas(): any[] {
    return this.esEstudiante ? this.tarjetasEstudiante : this.tarjetasTutor;
  }

  // 👉 getters para usar en el HTML
  get stats() {
    const s = this.dashSvc.stats();
    if (!s) return [];

    if (s.role === 'STUDENT') {
      return [
        { label: 'Tutorías inscritas', valor: s.tutoriasInscritas },
        { label: 'Sesiones con registro', valor: s.sesionesConAsistencia },
        { label: 'Asistencia general', valor: `${s.asistenciaPorcentaje}%` },
        { label: 'Horas de tutoría', valor: s.horasTutoria },
      ];
    }

    // TUTOR / ADMIN
    return [
      { label: 'Tutorías activas', valor: s.tutoriasActivas },
      { label: 'Estudiantes inscritos', valor: s.estudiantesInscritos },
      { label: 'Sesiones este mes', valor: s.sesionesMes },
      { label: 'Asistencias registradas', valor: s.asistenciasRegistradas },
    ];
  }

  get cargandoStats(): boolean {
    return this.dashSvc.loading();
  }

  get errorStats(): string | null {
    return this.dashSvc.error();
  }
}
