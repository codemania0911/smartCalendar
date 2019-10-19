import { TestBed } from '@angular/core/testing';

import { TravelItineraryService } from './travel-itinerary.service';

describe('TravelItineraryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TravelItineraryService = TestBed.get(TravelItineraryService);
    expect(service).toBeTruthy();
  });
});
