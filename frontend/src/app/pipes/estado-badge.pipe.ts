import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estadoBadge', standalone: true })
export class EstadoBadgePipe implements PipeTransform {
  transform(value: string): string {
    const map: Record<string, string> = {
      'ASISTIO': 'bg-success',
      'TARDANZA': 'bg-warning',
      'AUSENTE': 'bg-danger',
      'JUSTIFICADO': 'bg-info'
    };
    return map[value] || 'bg-secondary';
  }
}
