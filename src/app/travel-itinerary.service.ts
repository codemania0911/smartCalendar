import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { TravelItinerary } from 'src/app/travel-itinerary.model';

@Injectable({
  providedIn: 'root'
})
export class TravelItineraryService {

  constructor(private firestore: AngularFirestore) { }

  getTravelItinerary() {
    return this.firestore.collection('TravelItinerary').snapshotChanges();
  }

  createTravelItinerary(travelItinerary: TravelItinerary){
    return this.firestore.collection('TravelItinerary').add(travelItinerary);
}

updateTravelItinerary(travelItinerary: TravelItinerary){
  delete travelItinerary.id;
  this.firestore.doc('TravelItinerary/' + travelItinerary.id).update(travelItinerary);
}

deleteTravelItinerary(travelItineraryId: string){
  this.firestore.doc('TravelItinerary/' + travelItineraryId).delete();
}
}


