import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationmainRichii } from './simulationmain-richii';

describe('SimulationmainRichii', () => {
  let component: SimulationmainRichii;
  let fixture: ComponentFixture<SimulationmainRichii>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationmainRichii],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationmainRichii);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
