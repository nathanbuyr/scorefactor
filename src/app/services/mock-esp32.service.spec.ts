import { TestBed } from '@angular/core/testing';

import { MockESP32Service } from './mock-esp32.service';

describe('MockESP32Service', () => {
  let service: MockESP32Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockESP32Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
