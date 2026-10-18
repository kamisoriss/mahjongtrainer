import { TestBed } from '@angular/core/testing';
import { Analysemainriichi } from './analysemainriichi';

describe('Analysemainriichi', () => {
  let service: Analysemainriichi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Analysemainriichi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
