// src/app/observaciones/observaciones.ts
import { Component, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { AuthService } from '../services/auth.service';
import { TutoriasService } from '../services/tutorias.service';
import { SesionesService } from '../services/sesiones.service';
import { InscripcionesService } from '../services/inscripciones.service';
import { ObservacionesService } from '../services/observaciones.service';
import { ToastService } from '../services/toast.service';

import { User } from '../models/user.model';
import { Tutoria } from '../models/tutoria.model';
import { Sesion } from '../models/sesion.model';
import { Observacion } from '../models/observacion.model';

import { ObsFormComponent, ObsPayload } from './componentes/obs-form/obs-form';
import { ObsListComponent } from './componentes/obs-list/obs-list';

@Component({
  selector: 'tc-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ObsFormComponent, ObsListComponent],
  templateUrl: './observaciones.html',
  styleUrls: ['./observaciones.css']
})
export class ObservacionesComponent {
  // signals (se asignan en el constructor)
  user!: Signal<User | null>;
  tutorias!: Signal<Tutoria[]>;
  sesiones!: Signal<Sesion[]>;
  observaciones!: Signal<Observacion[]>;

  // selección de contexto
  tutoriaId: string | null = null;
  sesionId: string | null = null;
  estudianteId: string | null = null;

  // edición
  editObs: Observacion | null = null;

  detalleObs: Observacion | null = null;
soloPendientesUI = false;

  constructor(
    private auth: AuthService,
    private tutSvc: TutoriasService,
    private sesSvc: SesionesService,
    private inscSvc: InscripcionesService,
    private obsSvc: ObservacionesService,
     public toastSvc: ToastService
  ) {
    // asignaciones seguras (después de inyectar)
    this.user = this.auth.currentUser;
    this.tutorias = this.tutSvc.tutorias;
    this.sesiones = this.sesSvc.list;
    this.observaciones = this.obsSvc.lista;

     effect(() => {
      const u = this.user();
      if (!u) return;

      // Para STUDENT el backend ya ignora filtros y devuelve solo las suyas
      this.obsSvc.loadFromApi({});
     });
  }

  // helpers de rol
  get esEstudiante() { return this.user()?.role === 'STUDENT'; }
  get esStaff() { const r = this.user()?.role; return r === 'ADMIN' || r === 'TUTOR'; }

  // helpers de datos
  sesionesDeTutoria(): Sesion[] {
    if (!this.tutoriaId) return [];
    return this.sesiones().filter(s => s.tutoriaId === this.tutoriaId);
  }

  inscritosEmails(): string[] {
    if (!this.tutoriaId) return [];
    return this.inscSvc.lista()
      .filter(i => i.tutoriaId === this.tutoriaId && i.estado === 'ACTIVA')
      .map(i => i.estudianteId);
  }

  // listados según contexto
  listaStaff(): Observacion[] {
    if (!this.tutoriaId) return [];
    const base = this.obsSvc.listByTutoria(this.tutoriaId);
    return this.sesionId ? base.filter(o => o.sesionId === this.sesionId) : base;
  }

  listaAlumno(): Observacion[] {
    const mail = this.user()?.email || '';
    return this.obsSvc.listByEstudiante(mail);
  }

  // ===== métricas para estudiante (evita arrow functions en el template) =====
get alumnoTotal(): number {
  return this.listaAlumno().length;
}

get alumnoPendientes(): number {
  return this.listaAlumno().filter(o => !!o.pendiente).length;
}

get alumnoCompletadas(): number {
  return this.listaAlumno().filter(o => !o.pendiente).length;
}


  // acciones de UI
  startNew() { this.editObs = null; }
  startEdit(o: Observacion) {
    this.editObs = o;
    this.tutoriaId = o.tutoriaId;
    this.sesionId = o.sesionId ?? null;
    this.estudianteId = o.estudianteId;
  }

  async onSave(e: { id?: string, data: ObsPayload }) {
    const autor = this.user()?.email || '';
    if (!autor) return;

try {
  if (e.id) await this.obsSvc.update(e.id, e.data);
  else await this.obsSvc.add(e.data);

  this.toastSvc.show('Observación guardada ✅', 'success');
  this.cancelForm();
} catch (err) {
  console.error(err);
  this.toastSvc.show('No se pudo guardar ❌', 'danger');
}
  }

async onDelete(id: string) {
  if (!confirm('¿Eliminar observación?')) return;

  try {
    await this.obsSvc.remove(id);
    this.toastSvc.show('Observación eliminada ✅', 'success');
  } catch (e) {
    console.error(e);
    this.toastSvc.show('No se pudo eliminar ❌', 'danger');
  }
}


async onTogglePend(id: string) {
  try {
    await this.obsSvc.togglePendiente(id);
    this.toastSvc.show('Estado actualizado ✅', 'success');
  } catch (e) {
    console.error(e);
    this.toastSvc.show('No se pudo actualizar ❌', 'danger');
  }
}


  cancelForm() {
    this.editObs = null;
    // (opcional) mantener contexto seleccionado para registrar varias seguidas
  }

async onChangeTutoria(id: string | null) {
  this.sesionId = null;
  this.estudianteId = null;

  if (!id) return;

  await this.sesSvc.loadFromApi?.(id);
  await this.inscSvc.loadFromApi?.({ tutoriaId: id });

  //  opcional: refrescar TODO (no filtrado)
  await this.obsSvc.loadFromApi({});
}


openDetalle(o: Observacion) {
  this.detalleObs = o;

  const el = document.getElementById('obsDetailModal');
  // @ts-ignore
  const m = new bootstrap.Modal(el);
  m.show();

  // 🔑 SOLUCIÓN: quitar foco al cerrar
  el?.addEventListener(
    'hidden.bs.modal',
    () => {
      (document.activeElement as HTMLElement | null)?.blur();
    },
    { once: true }
  );
}


scrollToForm() {
  document.querySelector('#obs-form-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

toggleSoloPendientes() {
  this.soloPendientesUI = !this.soloPendientesUI;
  // si quieres controlar el checkbox interno del listado: lo más limpio es manejarlo en ObsList con @Input,
  // pero si no quieres tocar nada, déjalo como “acción visual” y listo.
}

private getExportRows() {
  // exporta lo que estás viendo en la lista (staff)
  const items = this.listaStaff(); // respeta tutoriaId + sesionId
  return items.map(o => ({
    Fecha: new Date(o.fecha).toLocaleString(),
    Estudiante: o.estudianteId,
    Tipo: o.tipo,
    Texto: o.texto,
    Pendiente: o.pendiente ? 'SI' : 'NO'
  }));
}

exportExcel() {
  const rows = this.getExportRows();
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Observaciones');
  XLSX.writeFile(wb, `observaciones_${Date.now()}.xlsx`);
  this.toastSvc.show('Excel exportado ✅', 'success');
}

exportPDF() {
  const rows = this.getExportRows();
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text('Observaciones académicas', 14, 12);

  autoTable(doc, {
    startY: 18,
    head: [['Fecha', 'Estudiante', 'Tipo', 'Texto', 'Pendiente']],
    body: rows.map(r => [r.Fecha, r.Estudiante, r.Tipo, r.Texto, r.Pendiente]),
    styles: { fontSize: 9 },
    columnStyles: { 3: { cellWidth: 120 } } // Texto
  });

  doc.save(`observaciones_${Date.now()}.pdf`);
  this.toastSvc.show('PDF exportado ✅', 'success');
}

labelTutoriaSeleccionada(): string {
  const t = this.tutorias().find(x => x.id === this.tutoriaId);
  return t ? `${t.codigoMateria} · ${t.titulo}` : String(this.tutoriaId);
}

labelSesionSeleccionada(): string {
  if (!this.sesionId) return '—';
  const s = this.sesiones().find(x => x.id === this.sesionId);
  return s ? `${s.fecha} · ${s.inicio}–${s.fin} · ${s.aula || ''}` : String(this.sesionId);
}

metricas() {
  const items = this.listaStaff();
  const pendientes = items.filter(x => !!x.pendiente).length;
  return {
    total: items.length,
    pendientes,
    resueltas: items.length - pendientes
  };
}

}
