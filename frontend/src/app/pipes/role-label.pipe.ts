import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '../models/user.model';

@Pipe({
    name: 'roleLabel',
    standalone: true
})
export class RoleLabelPipe implements PipeTransform {
    transform(value: UserRole): string {
        switch (value) {
            case 'ADMIN': return 'Administrador';
            case 'TUTOR': return 'Tutor';
            case 'STUDENT': return 'Estudiante';
            default: return value;
        }
    }
}
