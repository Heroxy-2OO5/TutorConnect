import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormGroup } from '@angular/forms';

// Debe terminar exactamente en @utmachala.edu.ec
export const utmachalaEmail = (): ValidatorFn => {
    const regex = /^[a-zA-Z0-9._%+-]+@utmachala\.edu\.ec$/i;
    return (control: AbstractControl): ValidationErrors | null => {
        const value = String(control.value || '').trim();
        return regex.test(value) ? null : { utmachalaEmail: true };
    };
};

// Al menos 8 caracteres, con minúscula, mayúscula, número y especial
export const strongPassword = (): ValidatorFn => {
  // 1 minúscula, 1 mayúscula, 1 número, 1 especial, min 8
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    return (control: AbstractControl): ValidationErrors | null => {
        const value = String(control.value || '');
        return regex.test(value) ? null : { strongPassword: true };
    };
};

// Requerido "duro" que no permita solo espacios
export const hardRequired = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = String(control.value || '');
        return value.trim().length ? null : { hardRequired: true };
    };
};

export const semestreEnRango = (min = 1, max = 10): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = Number(control.value);
    if (isNaN(v)) return { semestreEnRango: { reason: 'nan' } };
    if (v < min || v > max) return { semestreEnRango: { min, max } };
    return null;
  };
};

//Cupo no negativo
export const nonNegative = (): ValidatorFn => {
  return (c: AbstractControl): ValidationErrors | null => {
    const n = Number(c.value);
    if (Number.isNaN(n) || n < 0) return { nonNegative: true };
    return null;
  };
};


//1 Hora entre tutorias
export const oneHourBetween = (startKey: string, endKey: string) => {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const hi = g.get(startKey)?.value as string;
    const hf = g.get(endKey)?.value as string;
    if (!hi || !hf) return null;

    const [h1, m1] = hi.split(':').map(Number);
    const [h2, m2] = hf.split(':').map(Number);
    if ([h1,m1,h2,m2].some(n => Number.isNaN(n))) return { oneHourBetween: true };

    const mins = (h2*60 + m2) - (h1*60 + m1);
    return mins === 60 ? null : { oneHourBetween: { required: 60, actual: mins } };
  };
};