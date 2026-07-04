import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';              // ⬅️ NUEVO
import { MateriasService } from '../services/materias.service';
import { Materia } from '../models/materia.model';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

// hijos
import { MateriasListComponent } from './componentes/materias-list/materias-list';
import { MateriaFormComponent, MateriaPayload } from './componentes/materia-form/materia-form';
import { MateriasEstudianteListComponent } from './componentes/materias-estudiante-list/materias-estudiante-list'; // ⬅️ NUEVO


@Component({
  selector: 'tc-materias',
  standalone: true,
  imports: [CommonModule, FormsModule, MateriasListComponent, MateriaFormComponent, MateriasEstudianteListComponent   // ⬅️ NUEVO
], // ⬅️ FormsModule
  templateUrl: './materias.html',
  styleUrls: ['./materias.css']
})
export class MateriasComponent {
  materias!: Signal<Materia[]>;
  user!: Signal<User | null>;

  mostrandoForm = false;
  modo: 'crear' | 'editar' = 'crear';
  editId: string | null = null;
  editMateria: Materia | null = null;

  // 🔍 filtros
  busqueda = '';
  filtroSemestre: number | 'todos' = 'todos';
  semestres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(private mats: MateriasService, private auth: AuthService) {
    this.materias = this.mats.materias;
    this.user = this.auth.currentUser;

    // Cargar del backend al entrar
    this.mats.loadFromApi();
  }

  get puedeEditar(): boolean {
    const r = this.user()?.role;
    return r === 'ADMIN' || r === 'TUTOR';
  }

  // 👉 contador total
  get totalMaterias(): number {
    return this.materias().length;
  }

  // 👉 materias filtradas por buscador + semestre
  get materiasFiltradas(): Materia[] {
    const term = this.busqueda.trim().toLowerCase();
    const sem = this.filtroSemestre;

    return this.materias().filter(m => {
      const matchesTerm =
        term === '' ||
        m.nombre.toLowerCase().includes(term) ||
        m.codigo.toLowerCase().includes(term);

      const matchesSem =
        sem === 'todos' || m.semestre === sem;

      return matchesTerm && matchesSem;
    });
  }

  // eventos desde la lista
  onAdd() {
    if (!this.puedeEditar) return;
    this.modo = 'crear';
    this.editId = null;
    this.editMateria = null;
    this.mostrandoForm = true;
  }

  onEdit(mat: Materia) {
    if (!this.puedeEditar) return;
    this.modo = 'editar';
    this.editId = mat.id;
    this.editMateria = mat;
    this.mostrandoForm = true;
  }

  async onDelete(mat: Materia) {
    if (!this.puedeEditar) return;
    if (!confirm(`¿Eliminar la materia "${mat.nombre}"?`)) return;
    await this.mats.remove(mat.id);
  }

  // eventos del formulario
  onCancel() {
    this.mostrandoForm = false;
    this.editId = null;
    this.editMateria = null;
  }

  async onSave(payload: MateriaPayload) {
    if (this.modo === 'crear') {
      await this.mats.add(payload);
    } else if (this.editId) {
      await this.mats.update(this.editId, payload);
    }
    this.onCancel();
  }
}
