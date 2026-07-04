import { Pipe, PipeTransform } from '@angular/core';
import { Modalidad } from '../models/tutoria.model';

@Pipe({ name: 'modalidadLabel', standalone: true })
export class ModalidadLabelPipe implements PipeTransform {
  transform(m: Modalidad): string {
    return m === 'PRESENCIAL' ? 'Presencial' : 'Virtual';
  }
}
