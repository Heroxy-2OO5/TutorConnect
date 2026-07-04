import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaBonita',
  standalone: true
})
export class FechaBonitaPipe implements PipeTransform {

  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    let d: Date;
    if (value instanceof Date) {
      d = value;
    } else {
      d = new Date(value);
    }

    if (isNaN(d.getTime())) {
      // Si no se puede parsear, devolvemos el texto tal cual
      return String(value);
    }

    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = d.getFullYear();

    // formato dd/mm/aaaa (puedes cambiarlo si prefieres otro)
    return `${day}/${month}/${year}`;
  }
}
