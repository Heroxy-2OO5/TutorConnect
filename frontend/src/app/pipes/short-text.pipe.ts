import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortText',
  standalone: true
})
export class ShortTextPipe implements PipeTransform {
  transform(value: string | null | undefined, max = 120, ellipsis = '…'): string {
    const v = (value ?? '').trim();
    if (v.length <= max) return v;
    const cut = v.slice(0, max).trimEnd();
    return /\w/.test(v[max]) ? cut + ellipsis : cut;
  }
}
