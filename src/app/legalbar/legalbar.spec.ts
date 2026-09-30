import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Legalbar } from './legalbar';

describe('Legalbar', () => {
  let component: Legalbar;
  let fixture: ComponentFixture<Legalbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Legalbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Legalbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
