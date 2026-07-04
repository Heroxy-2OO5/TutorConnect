import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 👉 necesario para routerLink

@Component({
  selector: 'tc-acerca-de',
  standalone: true,
  imports: [CommonModule, RouterModule], // 👉 agrega RouterModule
  templateUrl: './acerca-de.html',
  styleUrls: ['./acerca-de.css']
})
export class AcercaDeComponent {}
