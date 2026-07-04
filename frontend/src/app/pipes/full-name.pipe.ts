import { Pipe, PipeTransform } from '@angular/core';

export interface NombreLike { firstName?: string; lastName?: string; }

@Pipe({
  name: 'fullName',
  standalone: true
})
export class FullNamePipe implements PipeTransform {
  transform(value: NombreLike | null | undefined): string {
    if (!value) return '';
    const n = (value.firstName ?? '').trim();
    const a = (value.lastName ?? '').trim();
    return `${n} ${a}`.trim();
  }
}
