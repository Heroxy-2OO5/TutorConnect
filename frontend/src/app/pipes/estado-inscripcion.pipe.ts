import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estadoInscripcionLabel', standalone: true })
export class EstadoInscripcionPipe implements PipeTransform {
  transform(v: string): string {
    switch (v) {
      case 'ACTIVA': return 'Activa';
      case 'CANCELADA': return 'Cancelada';
      default: return v;
    }
  }
}
