import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Materia } from '../../../models/materia.model';

@Component({
  selector: 'tc-materias-estudiante-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materias-estudiante-list.html',
  styleUrls: ['./materias-estudiante-list.css']
})
export class MateriasEstudianteListComponent {

  @Input() materias: Materia[] = [];

  expanded: string | null = null;

  toggleExpand(id: string) {
    this.expanded = this.expanded === id ? null : id;
  }

  getIcono(codigo: string): string {
    if (codigo.startsWith('prog')) return '📘';
    if (codigo.startsWith('mat')) return '📐';
    if (codigo.startsWith('fis')) return '⚛️';
    if (codigo.startsWith('tic') || codigo.startsWith('fti')) return '🌐';
    return '📚';
  }
}
