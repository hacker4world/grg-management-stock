import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortFabriquantsModalComponent } from './sort-fabriquants-modal.component';

describe('SortFabriquantsModalComponent', () => {
  let component: SortFabriquantsModalComponent;
  let fixture: ComponentFixture<SortFabriquantsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortFabriquantsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortFabriquantsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
