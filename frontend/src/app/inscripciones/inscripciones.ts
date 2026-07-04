// src/app/inscripciones/inscripciones.component.ts
import { Component, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { TutoriasService } from '../services/tutorias.service';
import { InscripcionesService } from '../services/inscripciones.service';
import { Tutoria } from '../models/tutoria.model';

import { AsientosDisponiblesPipe } from '../pipes/asientos-disponibles.pipe';
import { TimeRangePipe } from '../pipes/time-range.pipe';
import { ModalidadLabelPipe } from '../pipes/modalidad-label.pipe';
import { EstadoInscripcionPipe } from '../pipes/estado-inscripcion.pipe';

interface Toast {
  id: number;
  type: 'success' | 'info' | 'warning' | 'danger';
  text: string;
}

@Component({
  selector: 'tc-inscripciones',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AsientosDisponiblesPipe, TimeRangePipe, ModalidadLabelPipe, EstadoInscripcionPipe
  ],
  templateUrl: './inscripciones.html',
  styleUrls: ['./inscripciones.css'],
})

export class InscripcionesComponent {
  user!: Signal<User | null>;
  tutorias!: Signal<Tutoria[]>;

  // Filtros como signals internos
  private _query = signal('');
  private _filtroModalidad = signal<'' | 'PRESENCIAL' | 'VIRTUAL'>('');
  private _soloConCupos = signal(false);

  // Getters/setters para usarlos con [(ngModel)] en el template
  get query(): string {
    return this._query();
  }
  set query(value: string) {
    this._query.set(value);
  }

  get filtroModalidad(): '' | 'PRESENCIAL' | 'VIRTUAL' {
    return this._filtroModalidad();
  }
  set filtroModalidad(value: '' | 'PRESENCIAL' | 'VIRTUAL') {
    this._filtroModalidad.set(value);
  }

  get soloConCupos(): boolean {
    return this._soloConCupos();
  }
  set soloConCupos(value: boolean) {
    this._soloConCupos.set(value);
  }

  // 🔹 nuevas listas
  inscritas!: Signal<Tutoria[]>;
  disponibles!: Signal<Tutoria[]>;

  seleccionadaId: string | null = null;

    // ---------- TOASTS ----------
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  // Filtro de orden para la vista TUTOR/ADMIN
private _criterioOrden = signal<'HORA' | 'MATERIA' | 'OCUPACION'>('HORA');

get criterioOrden(): 'HORA' | 'MATERIA' | 'OCUPACION' {
  return this._criterioOrden();
}
set criterioOrden(value: 'HORA' | 'MATERIA' | 'OCUPACION') {
  this._criterioOrden.set(value);
}

tutoriasOrdenadas!: Signal<Tutoria[]>;

// ---------- SELECCIÓN MÚLTIPLE (VISTA TUTOR) ----------
private _seleccionados = signal<Set<string>>(new Set());

cantidadSeleccionados = computed(() => this._seleccionados().size);

isSeleccionado(id: string): boolean {
  return this._seleccionados().has(id);
}

toggleSeleccion(id: string, checked: boolean) {
  this._seleccionados.update(prev => {
    const nuevo = new Set(prev);
    if (checked) nuevo.add(id);
    else nuevo.delete(id);
    return nuevo;
  });
}

toggleSeleccionTodos(checked: boolean) {
  if (!checked) {
    // desmarcar todos
    this._seleccionados.set(new Set());
    return;
  }

  // seleccionar todos los inscritos activos de la tutoría seleccionada
  const ids = this.inscritosActivos().map(i => i.id);
  this._seleccionados.set(new Set(ids));
}


  // Tutoría que está en proceso de unirse/cancelar
  private _loadingTutoriaId = signal<string | null>(null);

    isLoading(t: Tutoria): boolean {
    return this._loadingTutoriaId() === t.id;
  }

  private showToast(type: Toast['type'], text: string) {
    const id = Date.now() + Math.random();
    this._toasts.update(list => [...list, { id, type, text }]);

    // Desaparece solo después de 3.5s
    setTimeout(() => {
      this._toasts.update(list => list.filter(t => t.id !== id));
    }, 3500);
  }

  closeToast(id: number) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  constructor(
    private auth: AuthService,
    private tutoriasSvc: TutoriasService,
    private inscSvc: InscripcionesService
  ) {
    this.user = this.auth.currentUser;
    this.tutorias = this.tutoriasSvc.tutorias;

        this.tutoriasOrdenadas = computed(() => {
      const criterio = this.criterioOrden;
      const base = [...this.tutorias()]; // clon para no mutar el original

      switch (criterio) {
        case 'MATERIA':
          return base.sort((a, b) => {
            const cmpCod = a.codigoMateria.localeCompare(b.codigoMateria);
            if (cmpCod !== 0) return cmpCod;
            return a.titulo.localeCompare(b.titulo);
          });

        case 'OCUPACION':
          // De mayor a menor ocupación
          return base.sort((a, b) => this.ocupados(b) - this.ocupados(a));

        case 'HORA':
        default:
          // Usa tu helper getStartDate(t) que ya definimos antes
          return base.sort(
            (a, b) => this.getStartDate(a).getTime() - this.getStartDate(b).getTime()
          );
      }
    });


    // Cargar tutorías
    this.tutoriasSvc.loadFromApi().catch(console.error);

    // Cargar inscripciones del estudiante (o todas si no es STUDENT)
    const u = this.user();
    if (u?.role === 'STUDENT') {
      // Cargar todas las inscripciones una sola vez
      this.inscSvc.loadFromApi().catch(console.error);
    } else {
      this.inscSvc.loadFromApi().catch(console.error);
    }

     this.inscritas = computed(() => {
      const u = this.user();
      if (!u) return [];

      const q         = this.query.trim().toLowerCase();
      const modalidad = this.filtroModalidad;
      const soloCupos = this.soloConCupos;

      return this.tutorias()
        .filter(t => {
          if (!this.inscSvc.estaInscrito(t.id, u.email)) return false;

          if (q && !this.coincideConBusqueda(t, q)) return false;
          if (modalidad && t.modalidad !== modalidad) return false;
          if (soloCupos && this.lleno(t)) return false;

          return true;
        })
        // 👉 Orden por hora de inicio más próxima
        .sort((a, b) => this.getStartDate(a).getTime() - this.getStartDate(b).getTime());
    });

    this.disponibles = computed(() => {
      const u = this.user();
      if (!u) return [];

      const q          = this.query.trim().toLowerCase();
      const modalidad  = this.filtroModalidad;
      const soloCupos  = this.soloConCupos;

      return this.tutorias().filter(t => {
        if (this.inscSvc.estaInscrito(t.id, u.email)) return false;

        if (q && !this.coincideConBusqueda(t, q)) return false;
        if (modalidad && t.modalidad !== modalidad) return false;
        if (soloCupos && this.lleno(t)) return false;

        return true;
      });
    });
  }

    // Construye un Date a partir de horaInicio/horaFin
  private getStartDate(t: Tutoria): Date {
    // Si tienes fecha en el modelo (por ej. t.fecha), usa eso:
    // const base = new Date(t.fecha);

    const today = new Date();
    const [h, m] = t.horaInicio.split(':').map(Number);
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      h || 0,
      m || 0,
      0,
      0
    );
  }

  private getEndDate(t: Tutoria): Date {
    const today = new Date();
    const [h, m] = t.horaFin.split(':').map(Number);
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      h || 0,
      m || 0,
      0,
      0
    );
  }

  // Devuelve label, clase del badge y descripción tipo "Empieza en 2 horas"
  estadoTiempo(t: Tutoria): { label: string; badgeClass: string; descripcion: string } {
    const ahora = new Date();
    const inicio = this.getStartDate(t);
    const fin = this.getEndDate(t);

    if (ahora > fin) {
      // Ya terminó
      const diffHoras = Math.abs((ahora.getTime() - fin.getTime()) / (1000 * 60 * 60));
      const horas = Math.round(diffHoras);
      const descripcion =
        horas < 1 ? 'Finalizó hace menos de una hora' :
        horas === 1 ? 'Finalizó hace 1 hora' :
        `Finalizó hace ${horas} horas`;

      return {
        label: 'Finalizada',
        badgeClass: 'bg-secondary',
        descripcion
      };
    }

    const diffMs = inicio.getTime() - ahora.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);

    if (diffHoras <= 0) {
      // Ya empezó pero aún no acaba
      return {
        label: 'En curso',
        badgeClass: 'bg-success',
        descripcion: 'La tutoría está en curso'
      };
    }

    // Aún no empieza
    const horas = Math.floor(diffHoras);
    const minutos = Math.round((diffHoras - horas) * 60);

    let descripcion = '';
    if (horas <= 0 && minutos > 0) {
      descripcion = `Empieza en ${minutos} min`;
    } else if (horas === 1) {
      descripcion = minutos
        ? `Empieza en 1 h ${minutos} min`
        : 'Empieza en 1 hora';
    } else if (horas > 1 && horas < 24) {
      descripcion = `Empieza en ${horas} h${minutos ? ' ' + minutos + ' min' : ''}`;
    } else {
      descripcion = 'Programada para más adelante';
    }

    // Si está a menos de 2 horas → "Por iniciar", si no → "Activa"
    const label = diffHoras <= 2 ? 'Por iniciar' : 'Activa';
    const badgeClass = diffHoras <= 2 ? 'bg-warning text-dark' : 'bg-info text-dark';

    return { label, badgeClass, descripcion };
  }


    private coincideConBusqueda(t: Tutoria, q: string): boolean {
    if (!q) return true;
    const texto = q.toLowerCase();
    return (
      t.codigoMateria.toLowerCase().includes(texto) ||
      t.tutorNombre.toLowerCase().includes(texto) ||
      t.titulo.toLowerCase().includes(texto)
    );
  }

  private pasaFiltros(t: Tutoria, q: string): boolean {
    // Filtro por texto
    if (!this.coincideConBusqueda(t, q)) return false;

    // Filtro por modalidad (si está seleccionado)
    if (this.filtroModalidad && t.modalidad !== this.filtroModalidad) {
      return false;
    }

    // Filtro "solo con cupos disponibles"
    if (this.soloConCupos && this.lleno(t)) {
      return false;
    }

    return true;
  }

  async quitarSeleccionados() {
  const seleccionados = Array.from(this._seleccionados().values());
  if (!seleccionados.length) return;

  if (!confirm(`¿Quitar ${seleccionados.length} inscrito(s) de esta tutoría?`)) {
    return;
  }

  let ok = 0;
  let error = 0;

  for (const id of seleccionados) {
    const resultado = await this.inscSvc.cancelarPorId(id);
    if (resultado === 'OK') ok++;
    else error++;
  }

  // limpiar selección
  this._seleccionados.set(new Set());

  if (ok && !error) {
    this.showToast('success', `Se quitaron ${ok} inscrito(s).`);
  } else if (ok && error) {
    this.showToast('warning', `Se quitaron ${ok} inscrito(s), pero ${error} no pudieron quitarse.`);
  } else {
    this.showToast('danger', 'No se pudo quitar a los estudiantes seleccionados.');
  }
}


onTutoriaChange(tutoriaId: string | null) {
  this.seleccionadaId = tutoriaId;
  // Ya no hace falta recargar, inscritosActivos() filtra por tutoriaId
}


  ocupados(t: Tutoria) { return this.inscSvc.countActivas(t.id); }
  yaInscrito(t: Tutoria) { return this.inscSvc.estaInscrito(t.id, this.user()?.email ?? ''); }
  lleno(t: Tutoria) { return this.ocupados(t) >= t.cupoMaximo; }

    async unirme(t: Tutoria) {
    const u = this.user();
    if (!u) return;

    if (this.lleno(t)) {
      this.showToast('warning', 'Cupo lleno.');
      return;
    }

    // Marcar como "procesando"
    this._loadingTutoriaId.set(t.id);

    const resultado = await this.inscSvc.inscribir(t.id, u.email);

    // Quitar estado de carga
    this._loadingTutoriaId.set(null);

    if (resultado === 'DUPLICADO') {
      this.showToast('warning', 'Ya estás inscrito en esta tutoría.');
    } else if (resultado === 'OK') {
      this.showToast('success', `Te inscribiste en "${t.titulo}".`);
    } else {
      this.showToast('danger', 'Hubo un error al inscribirte. Intenta de nuevo.');
    }
  }


    async cancelar(t: Tutoria) {
    const u = this.user();
    if (!u) return;
    if (!confirm('¿Cancelar tu inscripción?')) return;

    this._loadingTutoriaId.set(t.id);

    const resultado = await this.inscSvc.cancelar(t.id, u.email);

    this._loadingTutoriaId.set(null);

    if (resultado === 'OK') {
      this.showToast('info', `Cancelaste tu inscripción en "${t.titulo}".`);
    } else {
      this.showToast('danger', 'Hubo un error al cancelar. Intenta de nuevo.');
    }
  }


  get seleccionada(): Tutoria | null {
    return this.tutorias().find(t => t.id === this.seleccionadaId) ?? null;
  }

  inscritosActivos() {
    if (!this.seleccionadaId) return [];
    return this.inscSvc.lista().filter(i => i.tutoriaId === this.seleccionadaId && i.estado === 'ACTIVA');
  }

  // Porcentaje de ocupación de una tutoría
  ocupacionPorc(t: Tutoria | null): number {
    if (!t) return 0;
    const ocup = this.ocupados(t);
    if (!t.cupoMaximo || t.cupoMaximo <= 0) return 0;
    return Math.round((ocup / t.cupoMaximo) * 100);
  }

  // Copiar emails de los inscritos activos en la tutoría seleccionada
  async copiarCorreosSeleccionada() {
    const lista = this.inscritosActivos();
    if (!lista.length) {
      this.showToast('info', 'No hay correos que copiar.');
      return;
    }

    const texto = lista.map(i => i.estudianteId).join('; '); // o ',' si prefieres

    try {
      await navigator.clipboard.writeText(texto);
      this.showToast('success', 'Correos copiados al portapapeles.');
    } catch (err) {
      console.error('[Inscripciones] copiarCorreosSeleccionada error:', err);
      this.showToast('danger', 'No se pudo copiar al portapapeles.');
    }
  }


  async quitarInscrito(id: string) {
    if (!confirm('¿Quitar de la tutoría?')) return;
    const resultado = await this.inscSvc.cancelarPorId(id);
    if (resultado === 'OK') {
      alert('Estudiante removido de la tutoría.');
    } else {
      alert('Hubo un error al quitar al estudiante. Intenta de nuevo.');
    }
  }

  get esEstudiante() { return this.user()?.role === 'STUDENT'; }
  get esStaff() { const r = this.user()?.role; return r === 'ADMIN' || r === 'TUTOR'; }
}
