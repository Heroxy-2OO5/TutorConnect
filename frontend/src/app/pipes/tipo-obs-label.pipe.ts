import { Pipe, PipeTransform } from '@angular/core';
import { TipoObs } from '../models/observacion.model';

@Pipe({ name: 'tipoObsLabel', standalone: true })
export class TipoObsLabelPipe implements PipeTransform {
    transform(v: TipoObs): string {
        return v === 'FORTALEZA' ? 'Fortaleza'
        : v === 'DIFICULTAD' ? 'Dificultad'
        : v === 'ACUERDO'    ? 'Acuerdo'
        : 'Seguimiento';
    }
}
