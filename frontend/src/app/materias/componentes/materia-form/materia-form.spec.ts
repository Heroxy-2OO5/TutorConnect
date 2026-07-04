import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaForm } from './materia-form';

describe('MateriaForm', () => {
  let component: MateriaForm;
  let fixture: ComponentFixture<MateriaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
