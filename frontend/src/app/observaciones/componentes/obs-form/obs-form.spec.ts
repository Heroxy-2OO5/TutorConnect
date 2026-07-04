import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObsForm } from './obs-form';

describe('ObsForm', () => {
  let component: ObsForm;
  let fixture: ComponentFixture<ObsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
