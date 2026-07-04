import { Component, Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutoriasService } from '../services/tutorias.service';
import { Tutoria } from '../models/tutoria.model';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { MateriasService } from '../services/materias.service';
import { Materia } from '../models/materia.model';
import { TimeRangePipe } from '../pipes/time-range.pipe';
import { ModalidadLabelPipe } from '../pipes/modalidad-label.pipe';


// hijos
import { TutoriasListComponent } from './componentes/tutorias-list/tutorias-list';
import { TutoriaFormComponent, TutoriaPayload } from './componentes/tutorias-form/tutorias-form';

@Component({
  selector: 'tc-tutorias',
  standalone: true,
  imports: [CommonModule, TutoriasListComponent, TutoriaFormComponent, TimeRangePipe , ModalidadLabelPipe],
  templateUrl: './tutorias.html',
  styleUrls: ['./tutorias.css']
})
export class TutoriasComponent implements OnInit {
  tutorias!: Signal<Tutoria[]>;
  user!: Signal<User | null>;
  materias!: Signal<Materia[]>;
  tutores: User[] = [];           // lista local de tutores

  // --- estado para vista TUTOR/ADMIN ---
  mostrandoForm = false;
  modo: 'crear' | 'editar' = 'crear';
  editId: string | null = null;
  editTutoria: Tutoria | null = null;

  // --- estado para vista STUDENT ---
  searchTerm = '';
  filtroMateria = 'TODAS';
  filtroModalidad: 'TODAS' | 'PRESENCIAL' | 'VIRTUAL' = 'TODAS';
  itemsToShow = 6; // para "Ver más"

  constructor(
    private svc: TutoriasService,
    private auth: AuthService,
    private mats: MateriasService,
  ) {
    this.tutorias = this.svc.tutorias;
    this.user     = this.auth.currentUser;
    this.materias = this.mats.materias;
  }

  async ngOnInit(): Promise<void> {
    // Carga real desde el backend cada vez que entras
    this.svc.loadFromApi();
    this.mats.loadFromApi();
    await this.loadTutores();
  }

  private async loadTutores() {
    try {
      this.tutores = await this.auth.getTutors();
    } catch (e) {
      console.error('[Tutorias] Error cargando tutores', e);
      this.tutores = [];
    }
  }

  // --- helpers de rol ---
  get puedeEditar(): boolean {
    const r = this.user()?.role;
    return r === 'ADMIN' || r === 'TUTOR';
  }

  get esStudent(): boolean {
    return this.user()?.role === 'STUDENT';
  }

  // --- datos para header estudiante ---
  get totalTutorias(): number {
    return this.tutorias()?.length ?? 0;
  }

  // materias únicas para filtro
  get materiasDisponibles(): string[] {
    const set = new Set<string>();
    (this.tutorias() ?? []).forEach(t => {
      if (t.codigoMateria) set.add(t.codigoMateria);
    });
    return Array.from(set).sort();
  }

  // lista filtrada para las cards del estudiante
  get tutoriasFiltradas(): Tutoria[] {
    const all = this.tutorias() ?? [];
    const term = this.searchTerm.trim().toLowerCase();

    const filtradas = all.filter(t => {
      if (this.filtroMateria !== 'TODAS' && t.codigoMateria !== this.filtroMateria) return false;
      if (this.filtroModalidad !== 'TODAS' && t.modalidad !== this.filtroModalidad) return false;

      if (!term) return true;

      const texto = (
        t.titulo +
        ' ' + t.tutorNombre +
        ' ' + t.descripcion +
        ' ' + t.codigoMateria
      ).toLowerCase();

      return texto.includes(term);
    });

    return filtradas.slice(0, this.itemsToShow);
  }

  // --- acciones filtros estudiante ---
  onSearch(term: string) {
    this.searchTerm = term;
    this.itemsToShow = 6;
  }

  onChangeMateria(value: string) {
    this.filtroMateria = value || 'TODAS';
    this.itemsToShow = 6;
  }

  onChangeModalidad(value: string) {
    this.filtroModalidad = (value || 'TODAS') as any;
    this.itemsToShow = 6;
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroMateria = 'TODAS';
    this.filtroModalidad = 'TODAS';
    this.itemsToShow = 6;
  }

  verMas() {
    this.itemsToShow += 6;
  }

  // --- acciones TUTOR/ADMIN (igual que ya tenías) ---
  onAdd() {
    if (!this.puedeEditar) return;
    this.modo = 'crear';
    this.editId = null;
    this.editTutoria = null;
    this.mostrandoForm = true;
  }

  onEdit(t: Tutoria) {
    if (!this.puedeEditar) return;
    this.modo = 'editar';
    this.editId = t.id;
    this.editTutoria = t;
    this.mostrandoForm = true;
  }

  async onDelete(t: Tutoria) {
    if (!this.puedeEditar) return;
    if (!confirm(`¿Eliminar la tutoría "${t.titulo}"?`)) return;
    await this.svc.remove(t.id);
  }

  onCancel() {
    this.mostrandoForm = false;
    this.editId = null;
    this.editTutoria = null;
  }

  async onSave(payload: TutoriaPayload) {
    if (this.modo === 'crear') {
      await this.svc.add(payload);
    } else if (this.editId) {
      await this.svc.update(this.editId, payload);
    }
    this.onCancel();
  }
}
