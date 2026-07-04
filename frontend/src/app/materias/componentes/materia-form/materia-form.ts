import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Materia } from '../../../models/materia.model';
import { hardRequired, semestreEnRango } from '../../../validators/custom-validators';

export type MateriaPayload = Omit<Materia, 'id'>;

@Component({
  selector: 'tc-materia-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './materia-form.html',
  styleUrls: ['./materia-form.css']
})
export class MateriaFormComponent implements OnChanges {
  @Input() mode: 'crear' | 'editar' = 'crear';
  @Input() initial: Materia | null = null;
  @Input() canEdit = true;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<MateriaPayload>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      codigo: ['', [hardRequired()]],
      nombre: ['', [hardRequired()]],
      semestre: [1, [Validators.required, semestreEnRango(1, 10)]],
      descripcion: ['', [hardRequired()]]
    });
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['initial'] && this.initial) {
      // precarga cuando editas
      this.form.reset({
        codigo: this.initial.codigo,
        nombre: this.initial.nombre,
        semestre: this.initial.semestre,
        descripcion: this.initial.descripcion
      });
    }
    if (ch['mode'] && this.mode === 'crear' && !this.initial) {
      // estado limpio al crear
      this.form.reset({ codigo: '', nombre: '', semestre: 1, descripcion: '' });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: MateriaPayload = {
      codigo: String(this.form.value.codigo).trim(),
      nombre: String(this.form.value.nombre).trim(),
      semestre: Number(this.form.value.semestre),
      descripcion: String(this.form.value.descripcion).trim()
    };
    this.save.emit(payload);
  }
}
