import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(text: string, query: string): SafeHtml {
    if (!query?.trim()) return text;
    const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${q})`, 'ig');
    const html = (text ?? '').replace(re, '<mark class="tc-mark">$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
