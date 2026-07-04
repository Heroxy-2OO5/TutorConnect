export interface Sesion {
  id: string;
  tutoriaId: string;    // ref Tutoria.id
  fecha: string;        // 'YYYY-MM-DD'
  inicio: string;       // 'HH:mm'
  fin: string;          // 'HH:mm'
  aula: string;
  creadaPor?: string;    // email del tutor/admin
}
