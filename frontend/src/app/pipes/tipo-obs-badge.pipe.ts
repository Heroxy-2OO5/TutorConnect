import { Pipe, PipeTransform } from '@angular/core';
import { TipoObs } from '../models/observacion.model';

@Pipe({ name: 'tipoObsBadge', standalone: true })
export class TipoObsBadgePipe implements PipeTransform {
    transform(v: TipoObs): string {
        return v === 'FORTALEZA' ? 'bg-success'
        : v === 'DIFICULTAD' ? 'bg-danger'
        : v === 'ACUERDO'    ? 'bg-primary'
        : 'bg-warning';
    }
}
