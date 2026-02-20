import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortChantiersModalComponent } from './sort-chantiers-modal.component';

describe('SortChantiersModalComponent', () => {
  let component: SortChantiersModalComponent;
  let fixture: ComponentFixture<SortChantiersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortChantiersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortChantiersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
