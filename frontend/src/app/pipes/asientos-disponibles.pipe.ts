import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'asientosDisponibles', standalone: true })
export class AsientosDisponiblesPipe implements PipeTransform {
  transform(cupoMaximo: number, ocupados: number): string {
    const disp = Math.max(0, cupoMaximo - ocupados);
    return `${disp} de ${cupoMaximo}`;
  }
}
