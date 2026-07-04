import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { TutoriasService } from '../services/tutorias.service';
import { SesionesService } from '../services/sesiones.service';
import { AsistenciasService } from '../services/asistencias.service';
import { Tutoria } from '../models/tutoria.model';
import { Sesion } from '../models/sesion.model';
import { EstadoAsistencia } from '../models/asistencia.model';
import { TimeRangePipe } from '../pipes/time-range.pipe';
import { ModalidadLabelPipe } from '../pipes/modalidad-label.pipe';
import { EstadoAsistenciaPipe } from '../pipes/estado-asistencia.pipe';
import { EstadoBadgePipe } from '../pipes/estado-badge.pipe';
import { OnInit } from '@angular/core';
import { InscripcionesService } from '../services/inscripciones.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from '../../environments/environment';
import { FechaBonitaPipe } from '../pipes/fecha-bonita.pipe';



interface EstadisticasAsistencia {
  total: number;
  asistio: number;
  tardanza: number;
  ausente: number;
  justificado: number;
  porcentajeAsistencia: number; // 0–100
}

@Component({
  selector: 'tc-asistencias',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TimeRangePipe, ModalidadLabelPipe, EstadoAsistenciaPipe, EstadoBadgePipe, FechaBonitaPipe 
  ],
  templateUrl: './asistencias.html',
  styleUrls: ['./asistencias.css']
})



export class AsistenciasComponent implements OnInit{
  user!: Signal<User | null>;
  tutorias!: Signal<Tutoria[]>;
  sesiones!: Signal<Sesion[]>;

  tutoriaId: string | null = null;
  sesionId: string | null = null;
  q = '';

 feedback: { type: 'success' | 'danger'; text: string } | null = null;

private showFeedback(type: 'success' | 'danger', text: string) {
  this.feedback = { type, text };

  // Se cierra solo después de unos segundos
  setTimeout(() => {
    if (this.feedback?.text === text) {
      this.feedback = null;
    }
  }, 3500);
}
constructor(
  private auth: AuthService,
  private tutoriasSvc: TutoriasService,
  private sesionesSvc: SesionesService,
  public  asisSvc: AsistenciasService,
  private inscSvc: InscripcionesService,
) {
  this.user     = this.auth.currentUser;
  this.tutorias = this.tutoriasSvc.tutorias;
  this.sesiones = this.sesionesSvc.list;

  this.tutoriasSvc.loadFromApi().catch(console.error);

  const u = this.user();
  if (u?.role === 'STUDENT') {
    this.asisSvc.loadFromApi({ estudianteId: u.email }).catch(console.error);
  }
}

  // 🔹 cuando cambias la tutoría
  onTutoriaChange(tutoriaId: string | null) {
    this.tutoriaId = tutoriaId;
    this.sesionId = null;

    if (tutoriaId) {
      this.sesionesSvc.loadFromApi(tutoriaId).catch(console.error);
      // 👇 aquí viene la magia: pedimos inscripciones de esa tutoría al backend
      this.inscSvc.loadFromApi({ tutoriaId }).catch(console.error);
    }
  }


  get esEstudiante() { return this.user()?.role === 'STUDENT'; }
  get esStaff() { const r = this.user()?.role; return r === 'ADMIN' || r === 'TUTOR'; }

  sesionesDeTutoria(): Sesion[] {
    if (!this.tutoriaId) return [];
    return this.sesiones().filter(s => s.tutoriaId === this.tutoriaId);
  }

  tutoriaActual(): Tutoria | undefined {
    return this.tutorias().find(t => t.id === this.tutoriaId);
  }

  sesionActual(): Sesion | undefined {
    return this.sesiones().find(s => s.id === this.sesionId);
  }

async crearSesionSimple(fecha: string, inicio: string, fin: string, aula: string) {
  const u = this.user();
  if (!u || !this.tutoriaId) return;

  const resultado = await this.sesionesSvc.create(
    { tutoriaId: this.tutoriaId, fecha, inicio, fin, aula },
    u.email
  );

  if (resultado === 'OK') {
    this.showFeedback('success', 'Sesión creada exitosamente.');
  } else {
    this.showFeedback('danger', 'Error al crear la sesión.');
  }
}
async eliminarSesion(id: string) {
  if (!confirm('¿Eliminar esta sesión?')) return;

  const resultado = await this.sesionesSvc.remove(id);
  if (resultado === 'OK') {
    if (this.sesionId === id) this.sesionId = null;
    if (this.tutoriaId) {
      this.sesionesSvc.loadFromApi(this.tutoriaId).catch(console.error);
    }
    this.showFeedback('success', 'Sesión eliminada correctamente.');
  } else {
    this.showFeedback('danger', 'Error al eliminar la sesión.');
  }
}
 inscritosActivos(): string[] {
    const tid = this.tutoriaId;
    if (!tid) return [];

    // usamos los datos que ya están en el signal del servicio
    return this.inscSvc.getByTutoria(tid).map(i => i.estudianteId);
  }

  // asistencias.component.ts (parte del TUTOR)
async tomarAsistencia(s: Sesion) {
  this.sesionId = s.id;
  await this.asisSvc.loadFromApi({ sesionId: s.id }).catch(console.error);
}


  estadoDe(email: string): EstadoAsistencia | undefined {
    const sesId = this.sesionId;
    if (!sesId) return undefined;
    return this.asisSvc.getDeEstudiante(sesId, email)?.estado;
  }

  async marcar(email: string, estado: EstadoAsistencia) {
    const sesId = this.sesionId;
    if (!sesId) return;

    const resultado = await this.asisSvc.marcar(sesId, email, estado);
    if (resultado === 'OK') {
      console.log('Asistencia marcada correctamente');
    } else {
      alert('Error al marcar asistencia.');
    }
  }

  getSesionById(id: string | null | undefined): Sesion | undefined {
    if (!id) return undefined;
    return this.sesiones().find(s => s.id === id);
  }

  getTutoriaById(id: string | null | undefined): Tutoria | undefined {
    if (!id) return undefined;
    return this.tutorias().find(t => t.id === id);
  }

  selectSesion(id: string) {
  this.sesionId = id;
  this.asisSvc.loadFromApi({ sesionId: id }).catch(console.error);
}


async ngOnInit() {
    const u = this.user();

    // 👇 Lógica especial cuando entro como ESTUDIANTE
    if (u?.role === 'STUDENT') {
      // 1) Traer TODAS las asistencias de ese estudiante
      await this.asisSvc.loadFromApi({ estudianteId: u.email }).catch(console.error);

      // 2) Traer TODAS las sesiones (de todas las tutorías)
      await this.sesionesSvc.loadFromApi().catch(console.error);

      // 3) Asegurar que las tutorías están cargadas (por si acaso)
      await this.tutoriasSvc.loadFromApi().catch(console.error);
    }
  }

// ================= ESTADÍSTICAS PARA LA VISTA DE ESTUDIANTE =================
get statsEstudiante(): EstadisticasAsistencia | null {
  const u = this.user();
  if (!u) return null;

  const historial = this.asisSvc.historialDeEstudiante(u.email);
  const total = historial.length;

  if (total === 0) {
    return {
      total: 0,
      asistio: 0,
      tardanza: 0,
      ausente: 0,
      justificado: 0,
      porcentajeAsistencia: 0,
    };
  }

  const contar = (estado: EstadoAsistencia) =>
    historial.filter(a => a.estado === estado).length;

  const asistio      = contar('ASISTIO');
  const tardanza     = contar('TARDANZA');
  const ausente      = contar('AUSENTE');
  const justificado  = contar('JUSTIFICADO');

  // ✅ Nueva lógica:
  // Presentes = 1 punto
  // Justificados = 1 punto
  // Tardanzas = 0.5 punto
  // Ausente = 0
  const efectivos = asistio + justificado + tardanza * 0.5;

  const porcentajeAsistencia = Math.round((efectivos / total) * 100);

  return {
    total,
    asistio,
    tardanza,
    ausente,
    justificado,
    porcentajeAsistencia,
  };
}

// ================= HELPER: construir filas de la tabla del estudiante =================
private buildFilasEstudiante() {
  const u = this.user();
  if (!u) return [];

  const historial = this.asisSvc.historialDeEstudiante(u.email);

  const labelEstado: Record<EstadoAsistencia, string> = {
    ASISTIO: 'Presente',
    TARDANZA: 'Tarde',
    AUSENTE: 'Ausente',
    JUSTIFICADO: 'Justificado',
  };

  const filtro = (this.q || '').toLowerCase();

  const filas: {
    materia: string;
    fecha: string;
    hora: string;
    aula: string;
    estado: string;
  }[] = [];

  for (const a of historial) {
    const s = this.getSesionById(a.sesionId);
    if (!s) continue;

    const t = this.getTutoriaById(s.tutoriaId);
    if (!t) continue;

    const textoBusqueda = (t.titulo + ' ' + t.codigoMateria).toLowerCase();
    if (filtro && !textoBusqueda.includes(filtro)) continue;

    filas.push({
      materia: `${t.codigoMateria} · ${t.titulo}`,
      fecha: s.fecha,
      hora: `${s.inicio} – ${s.fin}`,
      aula: s.aula,
      estado: labelEstado[a.estado],
    });
  }

  return filas;
}

// ================= EXPORTAR A EXCEL =================
async exportExcelEstudiante() {
  const filas = this.buildFilasEstudiante();
  if (!filas.length) {
    alert('No hay asistencias para exportar.');
    return;
  }

  const u = this.user();
  const ws = XLSX.utils.json_to_sheet(
    filas.map(f => ({
      'Materia / Título': f.materia,
      'Fecha': f.fecha,
      'Hora': f.hora,
      'Aula': f.aula,
      'Estado': f.estado,
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `asistencias_${u?.email || 'estudiante'}.xlsx`);
}

// ================= EXPORTAR A PDF =================
async exportPdfEstudiante() {
  const filas = this.buildFilasEstudiante();
  if (!filas.length) {
    alert('No hay asistencias para exportar.');
    return;
  }

  const u = this.user();

  const doc = new jsPDF('l', 'pt', 'a4'); // horizontal, puntos, A4
  doc.setFontSize(14);
  doc.text('Reporte de asistencias', 40, 40);
  if (u?.email) {
    doc.setFontSize(10);
    doc.text(`Estudiante: ${u.email}`, 40, 60);
  }

  autoTable(doc, {
    startY: 80,
    head: [['Materia / Título', 'Fecha', 'Hora', 'Aula', 'Estado']],
    body: filas.map(f => [f.materia, f.fecha, f.hora, f.aula, f.estado]),
  });

  doc.save(`asistencias_${u?.email || 'estudiante'}.pdf`);
}

// ================= HELPER: filas de la sesión actual (vista TUTOR) =================
private buildFilasSesionActualTutor() {
  const s = this.sesionActual();
  const t = this.tutoriaActual();

  if (!s || !t) return [];

  const labelEstado: Record<EstadoAsistencia, string> = {
    ASISTIO: 'Presente',
    TARDANZA: 'Tarde',
    AUSENTE: 'Ausente',
    JUSTIFICADO: 'Justificado',
  };

  const filas: {
    estudiante: string;
    materia: string;
    fecha: string;
    hora: string;
    aula: string;
    estado: string;
  }[] = [];

  for (const email of this.inscritosActivos()) {
    const reg = this.asisSvc.getDeEstudiante(s.id, email);
    const estado = reg ? labelEstado[reg.estado] : 'Sin marcar';

    filas.push({
      estudiante: email,
      materia: `${t.codigoMateria} · ${t.titulo}`,
      fecha: s.fecha,
      hora: `${s.inicio} – ${s.fin}`,
      aula: s.aula,
      estado,
    });
  }

  return filas;
}

// ================= EXPORTAR SESIÓN ACTUAL (TUTOR) A EXCEL =================
exportExcelSesionActualTutor() {
  const filas = this.buildFilasSesionActualTutor();
  if (!filas.length) {
    alert('No hay datos para exportar. Asegúrate de haber seleccionado una sesión y tener inscritos.');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(
    filas.map(f => ({
      'Materia / Título': f.materia,
      'Fecha': f.fecha,
      'Hora': f.hora,
      'Aula': f.aula,
      'Estudiante': f.estudiante,
      'Estado': f.estado,
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asistencia sesión');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const s = this.sesionActual();
  const t = this.tutoriaActual();
  const nombre = t ? `${t.codigoMateria}_${s?.fecha}` : 'sesion';

  saveAs(blob, `asistencia_${nombre}.xlsx`);
}

// ================= EXPORTAR SESIÓN ACTUAL (TUTOR) A PDF =================
exportPdfSesionActualTutor() {
  const filas = this.buildFilasSesionActualTutor();
  if (!filas.length) {
    alert('No hay datos para exportar. Asegúrate de haber seleccionado una sesión y tener inscritos.');
    return;
  }

  const s = this.sesionActual();
  const t = this.tutoriaActual();

  const doc = new jsPDF('l', 'pt', 'a4'); // horizontal
  doc.setFontSize(14);
  doc.text('Lista de asistencia', 40, 40);

  if (t && s) {
    doc.setFontSize(10);
    doc.text(
      `${t.codigoMateria} · ${t.titulo} — ${s.fecha} ${s.inicio}–${s.fin} · ${s.aula}`,
      40,
      60
    );
  }

  autoTable(doc, {
    startY: 80,
    head: [['Estudiante', 'Materia / Título', 'Fecha', 'Hora', 'Aula', 'Estado']],
    body: filas.map(f => [
      f.estudiante,
      f.materia,
      f.fecha,
      f.hora,
      f.aula,
      f.estado,
    ]),
  });

  const nombre = t ? `${t.codigoMateria}_${s?.fecha}` : 'sesion';
  doc.save(`asistencia_${nombre}.pdf`);
}

// ================= EXPORTAR TODAS LAS SESIONES DE LA TUTORÍA (TUTOR) =================
async exportPdfTodasSesionesTutor() {
  const t = this.tutoriaActual();
  if (!t) {
    alert('Primero selecciona una tutoría.');
    return;
  }

  const sesiones = this.sesionesDeTutoria();
  if (!sesiones.length) {
    alert('Esta tutoría no tiene sesiones.');
    return;
  }

  const doc = new jsPDF('l', 'pt', 'a4');

  // Cabecera del reporte
  doc.setFontSize(14);
  doc.text('Reporte de asistencias por tutoría', 40, 40);

  doc.setFontSize(10);
  doc.text(
    `${t.codigoMateria} · ${t.titulo} — Tutor: ${t.tutorNombre}`,
    40,
    60
  );

  const labelEstado: Record<EstadoAsistencia, string> = {
    ASISTIO: 'Presente',
    TARDANZA: 'Tarde',
    AUSENTE: 'Ausente',
    JUSTIFICADO: 'Justificado',
  };

  const body: any[] = [];

  // Recorremos todas las sesiones de la tutoría
  for (const s of sesiones) {
    try {
      const url = `${environment.apiUrl}/asistencias?sesionId=${encodeURIComponent(
        s.id
      )}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        console.error('[exportPdfTodasSesionesTutor] error HTTP', res.status);
        continue;
      }

      type ApiAsistencia = {
        id: number;
        sesion_id: number;
        estudiante_id: string;
        estado: EstadoAsistencia;
        observacion: string | null;
        registrado_por: string | null;
        registrado_en: string;
      };

      const data = (await res.json()) as ApiAsistencia[];

      if (!data.length) {
        // Si no hay asistencias marcadas en esa sesión, igual la reflejamos
        body.push([
          `${s.fecha}`,
          `${s.inicio} – ${s.fin}`,
          s.aula,
          '—',
          'Sin marcar',
        ]);
        continue;
      }

      for (const a of data) {
        body.push([
          `${s.fecha}`,
          `${s.inicio} – ${s.fin}`,
          s.aula,
          a.estudiante_id,
          labelEstado[a.estado] || a.estado,
        ]);
      }
    } catch (err) {
      console.error('[exportPdfTodasSesionesTutor] error fetch asistencias:', err);
    }
  }

  if (!body.length) {
    alert('No hay asistencias registradas en ninguna sesión de esta tutoría.');
    return;
  }

  autoTable(doc, {
    startY: 80,
    head: [['Fecha', 'Hora', 'Aula', 'Estudiante', 'Estado']],
    body,
  });

  const nombre = `${t.codigoMateria}_todas_sesiones`;
  doc.save(`asistencias_${nombre}.pdf`);
}


}

