import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombinaisonRichii } from './combinaison-richii';

describe('CombinaisonRichii', () => {
  let component: CombinaisonRichii;
  let fixture: ComponentFixture<CombinaisonRichii>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinaisonRichii],
    }).compileComponents();

    fixture = TestBed.createComponent(CombinaisonRichii);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
