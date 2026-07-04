import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriasList } from './materias-list';

describe('MateriasList', () => {
  let component: MateriasList;
  let fixture: ComponentFixture<MateriasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
