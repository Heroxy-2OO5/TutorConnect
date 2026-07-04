import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'semestreLabel',
  standalone: true
})
export class SemestreLabelPipe implements PipeTransform {
  transform(sem: number | null | undefined): string {
    const n = Number(sem ?? 0);
    return n > 0 ? `Semestre ${n}` : '';
  }
}
