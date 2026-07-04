import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeRange', standalone: true })
export class TimeRangePipe implements PipeTransform {
  transform(horaInicio: string, horaFin: string): string {
    return `${horaInicio} – ${horaFin}`;
  }
}
