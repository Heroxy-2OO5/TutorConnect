import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriasEstudianteList } from './materias-estudiante-list';

describe('MateriasEstudianteList', () => {
  let component: MateriasEstudianteList;
  let fixture: ComponentFixture<MateriasEstudianteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriasEstudianteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriasEstudianteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
