// src/app/models/asistencia.model.ts
export type EstadoAsistencia = 'ASISTIO' | 'TARDANZA' | 'AUSENTE' | 'JUSTIFICADO';

export interface Asistencia {
  id: string;
  sesionId: string;
  estudianteId: string;
  estado: EstadoAsistencia;
  observacion: string | null;
}
