import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estadoAsistencia', standalone: true })
export class EstadoAsistenciaPipe implements PipeTransform {
  transform(value: string): string {
    const map: Record<string, string> = {
      'ASISTIO': 'Presente',
      'TARDANZA': 'Tarde',
      'AUSENTE': 'Ausente',
      'JUSTIFICADO': 'Justificado'
    };
    return map[value] || value;
  }
}
