export type EstadoInscripcion = 'ACTIVA' | 'CANCELADA';

export interface Inscripcion {
  id: string;
  tutoriaId: string;
  estudianteId: string; // usa el email institucional del AuthService
  creadoEn: string;     // ISO date
  estado: EstadoInscripcion;
}
