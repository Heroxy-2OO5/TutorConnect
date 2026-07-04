import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tutoria } from '../../../models/tutoria.model';
import { TimeRangePipe } from '../../../pipes/time-range.pipe';
import { ModalidadLabelPipe } from '../../../pipes/modalidad-label.pipe';

@Component({
  selector: 'tc-tutorias-list',
  standalone: true,
  imports: [CommonModule, TimeRangePipe, ModalidadLabelPipe],
  templateUrl: './tutorias-list.html',
  styleUrls: ['./tutorias-list.css']
})
export class TutoriasListComponent {
  @Input() tutorias: Tutoria[] = [];
  @Input() canEdit = false;

  @Output() add    = new EventEmitter<void>();
  @Output() edit   = new EventEmitter<Tutoria>();
  @Output() remove = new EventEmitter<Tutoria>();
}
