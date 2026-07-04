import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObsList } from './obs-list';

describe('ObsList', () => {
  let component: ObsList;
  let fixture: ComponentFixture<ObsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
