import { Component, OnInit, NgZone, Pipe, PipeTransform, OnChanges  } from '@angular/core';
import { AuthService } from "../../shared/services/auth.service";
import { Router } from "@angular/router";
import { AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { FilterPipe } from 'ngx-filter-pipe';
import { TravelItinerary } from '../../travel-itinerary.model'
import { TravelItineraryService } from '../../travel-itinerary.service'

@Pipe({
  name: 'itineraryFilter',
  pure: false
})

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  constructor(
    public authService: AuthService,
    public router: Router,
    public ngZone: NgZone,
    private af: AngularFireDatabase,
    private spinner: NgxSpinnerService,
    private filterPipe: FilterPipe,
    private travelItineraryService: TravelItineraryService
  ) { }


  travelItinerary$: AngularFireList<any[]>;
  travelItineraries: Observable<any[]>;
  isBusy: Boolean;
  selectedValue: String;
  filterDateMode: String;
  availableOptions : any[];
  dateFilter : Observable<any[]>;
  travelItinerary: TravelItinerary[];

  ngOnInit() { 
    this.availableOptions =['None','Staff','Month'] 
    this.selectedValue = 'None'
    this.filterDateMode ='upcoming'
    this.spinner.show();
    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 2000);
    this.travelItineraries = this.af.list('/TravelItinerary').valueChanges();
    this.dateFilter = this.travelItineraries;
    // this.travelItineraryService.getTravelItinerary().subscribe(data => {
    //   this.travelItinerary = data.map( e=>{
    //     return {
    //       id: e.payload.doc.id,
    //       ...e.payload.doc.data()
    //     } as TravelItinerary
    //   })
    // })
  }


  addTravelItinerary(value: string): void {
    // ...
  }
  deleteTravelItinerary(todo: any): void {
    // ...
  }

  toggleDone(todo: any): void {
    // ...
  }

  updateTravelItinerary(todo: any, newValue: string): void {
    // ...
  }

  ngOnChanges(changes) {
    console.log(changes);
}

  setDateFilter (item) { 

    if(item ==='None'){
      console.log('yes')
    } else if(item ==='Staff'){
      console.log('no')
    }else if(item ==='Month'){
      console.log('haha')
    }

    // if(this.filterDateMode==='upcoming') {
    //   if(item.endsAt> new Date()){
    //     return item
    //   }
    // } else if(this.filterDateMode==='past') {
    //   if(item.endsAt< new Date()){
    //     return item
    //   }
    // } else {
    //   return item
    // }
  };

}
