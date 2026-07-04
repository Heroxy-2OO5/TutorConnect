import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'year',
  standalone: true
})
export class YearPipe implements PipeTransform {
  // Si no pasas nada, usa la fecha actual; si pasas Date/string/number, saca su año
  transform(value?: Date | string | number): string {
    const d = value ? new Date(value) : new Date();
    return String(d.getFullYear());
  }
}
