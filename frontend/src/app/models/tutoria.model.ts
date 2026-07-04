export type Modalidad = 'PRESENCIAL' | 'VIRTUAL';

export interface Tutoria {
  id: string;              // autogenerado
  codigoMateria: string;   // ej: "mt-3"
  tutorNombre: string;
  titulo: string;
  descripcion: string;
  horaInicio: string;      // "HH:mm"
  horaFin: string;         // "HH:mm"
  aula: string;
  modalidad: Modalidad;
  cupoMaximo: number;      // >= 0
}
