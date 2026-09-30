import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombinaisonMcr } from './combinaison-mcr';

describe('CombinaisonMcr', () => {
  let component: CombinaisonMcr;
  let fixture: ComponentFixture<CombinaisonMcr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinaisonMcr],
    }).compileComponents();

    fixture = TestBed.createComponent(CombinaisonMcr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
