import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { hardRequired, strongPassword, utmachalaEmail } from '../validators/custom-validators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserRole } from '../models/user.model';

@Component({
  selector: 'tc-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  tab: 'login' | 'register' = 'login';

  roles: { value: UserRole; label: string }[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'TUTOR', label: 'Tutor' },
    { value: 'STUDENT', label: 'Estudiante' }
  ];

  registerForm!: FormGroup;
  loginForm!: FormGroup;

  successMsg: string | null = null;
  errorMsg: string | null = null;
  isBusy = false;
  showLoginPass = false;
  showRegisterPass = false;
  capsOn = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', [hardRequired()]],
      lastName: ['', [hardRequired()]],
      email: ['', [Validators.required, utmachalaEmail()]],
      role: ['STUDENT' as UserRole, [Validators.required]],
      password: ['', [Validators.required, strongPassword()]]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  rf(name: string): AbstractControl { return this.registerForm.get(name)!; }
  lf(name: string): AbstractControl { return this.loginForm.get(name)!; }

  switchTab(t: 'login' | 'register', keepSuccess = false) {
    this.tab = t;
    if (!keepSuccess) this.successMsg = null;
    this.errorMsg = null;
  }

  // ⬇⬇⬇ AHORA async + await
  async submitRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMsg = 'Revisa los campos: hay validaciones pendientes.';
      return;
    }

    this.isBusy = true;
    const { firstName, lastName, email, role, password } = this.registerForm.value;

    const res = await this.auth.register({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).trim(),
      role: role as UserRole,
      password: String(password)
    });
    this.isBusy = false;

    if (!res.ok) {
      this.errorMsg = res.msg;
      return;
    }
    // ✅ Éxito
    this.registerForm.reset({ role: 'STUDENT' });    
    // (opcional) pasar el correo al login para que no lo escriba otra vez
    this.loginForm.patchValue({ email: String(email).trim(), password: '' });    
    // ✅ cambia a login primero
    this.switchTab('login', true);    
    // ✅ y luego recién muestra el mensaje
    this.successMsg = '✅ Usuario registrado exitosamente. Ahora puedes iniciar sesión.';
  }

  // ⬇⬇⬇ AHORA async + await
  async submitLogin() {
    this.successMsg = null;
    this.errorMsg = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMsg = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.isBusy = true;
    const { email, password } = this.loginForm.value;
    const res = await this.auth.login(String(email).trim(), String(password));
    this.isBusy = false;

    if (!res.ok) {
      this.errorMsg = res.msg;
      return;
    }

    this.successMsg = '¡Bienvenido! Redirigiendo…';
    this.router.navigateByUrl('/dashboard');
  }

  onCapsCheck(ev: KeyboardEvent) {
  this.capsOn = ev.getModifierState && ev.getModifierState('CapsLock');
}
}
