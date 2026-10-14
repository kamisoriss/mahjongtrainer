import { TestBed } from '@angular/core/testing';
import { Analysemainmcr } from './analysemainmcr';

describe('Analysemainmcr', () => {
  let service: Analysemainmcr;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Analysemainmcr);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
