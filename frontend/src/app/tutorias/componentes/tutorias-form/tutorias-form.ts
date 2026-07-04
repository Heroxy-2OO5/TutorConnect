import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tutoria } from '../../../models/tutoria.model';
import { hardRequired, nonNegative, oneHourBetween } from '../../../validators/custom-validators';
import { Materia } from '../../../models/materia.model';
import { User } from '../../../models/user.model';

export type TutoriaPayload = Omit<Tutoria,'id'>;

@Component({
  selector: 'tc-tutoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tutorias-form.html',
  styleUrls: ['./tutorias-form.css']
})
export class TutoriaFormComponent implements OnChanges {
  @Input() mode: 'crear'|'editar' = 'crear';
  @Input() initial: Tutoria | null = null;
  @Input() canEdit = true;
  @Input() materias: Materia[] = [];
  @Input() tutores: User[] = [];    


  @Output() cancel = new EventEmitter<void>();
  @Output() save   = new EventEmitter<TutoriaPayload>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      codigoMateria: ['', [hardRequired()]],
      tutorNombre:   ['', [hardRequired()]],
      titulo:        ['', [hardRequired()]],
      descripcion:   ['', [hardRequired()]],
      horaInicio:    ['08:00', [Validators.required]],
      horaFin:       ['09:00', [Validators.required]],
      aula:          ['', [hardRequired()]],
      modalidad:     ['PRESENCIAL', [Validators.required]],
      cupoMaximo:    [20, [Validators.required, nonNegative()]],
    }, { validators: [oneHourBetween('horaInicio','horaFin')] });
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['initial'] && this.initial) {
      const { id, ...rest } = this.initial;
      this.form.reset(rest);
    }
    if (ch['mode'] && this.mode === 'crear' && !this.initial) {
      this.form.reset({
        codigoMateria:'', tutorNombre:'', titulo:'', descripcion:'',
        horaInicio:'08:00', horaFin:'09:00', aula:'', modalidad:'PRESENCIAL', cupoMaximo:20
      });
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.save.emit(this.form.value as TutoriaPayload);
  }
}
