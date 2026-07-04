import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Materia } from '../../../models/materia.model';
import { SemestreLabelPipe } from '../../../pipes/semestre-label.pipe';
import { ShortTextPipe } from '../../../pipes/short-text.pipe';

@Component({
  selector: 'tc-materias-list',
  standalone: true,
  imports: [CommonModule, SemestreLabelPipe, ShortTextPipe],
  templateUrl: './materias-list.html',
  styleUrls: ['./materias-list.css']
})
export class MateriasListComponent {
  @Input() materias: Materia[] = [];
  @Input() canEdit = false;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Materia>();
  @Output() remove = new EventEmitter<Materia>();

  // ids de materias con descripción expandida
  expanded = new Set<string>();

  toggleDescripcion(m: Materia) {
    if (this.expanded.has(m.id)) {
      this.expanded.delete(m.id);
    } else {
      this.expanded.add(m.id);
    }
  }

  // icono según semestre (1..10)
  getSemestreIcon(semestre: number): string {
    const icons = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
    return icons[semestre - 1] ?? '•';
  }
}
