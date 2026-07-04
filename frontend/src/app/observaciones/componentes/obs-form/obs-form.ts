import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoObs, Observacion } from '../../../models/observacion.model';

export type ObsPayload = {
  tutoriaId: string;
  sesionId?: string;
  estudianteId: string;
  tipo: TipoObs;
  texto: string;
  pendiente?: boolean;
  calificacion?: number;
};

@Component({
  selector: 'tc-obs-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './obs-form.html',
  styleUrls: ['./obs-form.css']
})
export class ObsFormComponent {
  @Input({ required: true }) tutoriaId!: string;
  @Input() sesionId?: string;
  @Input({ required: true }) estudianteId!: string;
  @Input() editData?: Observacion;

  @Output() guardar = new EventEmitter<{ id?: string, data: ObsPayload }>();
  @Output() cancelar = new EventEmitter<void>();

  form!: FormGroup;

  tipos: TipoObs[] = ['FORTALEZA','DIFICULTAD','ACUERDO','SEGUIMIENTO'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      tipo: ['FORTALEZA', Validators.required],
      texto: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      pendiente: [false],
      calificacion: [null as number | null]
    });
  }

  ngOnChanges() {
    // inicializar siempre con el contexto actual (tutoriaId, sesionId, estudianteId vienen por @Input)
    if (this.editData) {
      this.form.patchValue({
        tipo: this.editData.tipo,
        texto: this.editData.texto,
        pendiente: this.editData.pendiente ?? false,
        calificacion: this.editData.calificacion ?? null
      });
    } else {
      this.form.reset({ tipo: 'FORTALEZA', texto: '', pendiente: false, calificacion: null });
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const payload: ObsPayload = {
      tutoriaId: this.tutoriaId,
      sesionId: this.sesionId || undefined,
      estudianteId: this.estudianteId,
      tipo: v['tipo'],
      texto: v['texto'],
      pendiente: !!v['pendiente'],
      calificacion: v['calificacion'] ?? undefined
    };
    this.guardar.emit({ id: this.editData?.id, data: payload });
  }
}
