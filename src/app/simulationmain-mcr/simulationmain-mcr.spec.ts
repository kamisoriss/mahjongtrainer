import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationmainMcr } from './simulationmain-mcr';

describe('SimulationmainMcr', () => {
  let component: SimulationmainMcr;
  let fixture: ComponentFixture<SimulationmainMcr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationmainMcr],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationmainMcr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
