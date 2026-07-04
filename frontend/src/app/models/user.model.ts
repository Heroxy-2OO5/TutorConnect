export type UserRole = 'ADMIN' | 'TUTOR' | 'STUDENT';

export interface User {
    id: string;              // generado automáticamente
    firstName: string;
    lastName: string;
    email: string;           // debe terminar en @utmachala.edu.ec
    role: UserRole;
    password: string;        // (demo) no en producción
}
