export type TipoObs = 'FORTALEZA' | 'DIFICULTAD' | 'ACUERDO' | 'SEGUIMIENTO';

export interface Observacion {
    id: string;
    tutoriaId: string;
    sesionId?: string;
    estudianteId: string;   // email institucional
    autorId: string;        // email del tutor/admin que registró
    fecha: string;          // ISO string
    tipo: TipoObs;
    texto: string;
    pendiente?: boolean;    // para seguimiento
    calificacion?: number;  // opcional 1..5
}
