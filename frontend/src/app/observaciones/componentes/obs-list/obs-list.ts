import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observacion } from '../../../models/observacion.model';
import { TipoObsBadgePipe } from '../../../pipes/tipo-obs-badge.pipe';
import { TipoObsLabelPipe } from '../../../pipes/tipo-obs-label.pipe';
import { ShortTextPipe } from '../../../pipes/short-text.pipe'; // si ya lo tienes
import { FormsModule } from '@angular/forms';
import { HighlightPipe }  from '../../../pipes/highlight.pipe';

@Component({
  selector: 'tc-obs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TipoObsBadgePipe, ShortTextPipe, HighlightPipe],
  templateUrl: './obs-list.html',
  styleUrls: ['./obs-list.css']
})
export class ObsListComponent {
  @Input({ required: true }) items: Observacion[] = [];
  @Input() titulo = 'Observaciones';
  @Input() puedeEditar = false;

  @Output() editar = new EventEmitter<Observacion>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() togglePend = new EventEmitter<string>();
  @Output() verDetalle = new EventEmitter<Observacion>();


  filtro = '';
  pendientesOnly = false;

  filtrar(o: Observacion) {
    if (this.pendientesOnly && !o.pendiente) return false;
    const q = this.filtro.trim().toLowerCase();
    if (!q) return true;
    return (o.texto + ' ' + (o.estudianteId ?? '')).toLowerCase().includes(q);
  }
  trackById(_i: number, o: Observacion) { return o.id; }

  clearFilters() {
  this.filtro = '';
  this.pendientesOnly = false;
}


}
