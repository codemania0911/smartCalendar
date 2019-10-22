'use strict';

angular.module('myApp.view_dash_board', ['ngRoute','mwl.calendar', 'ngPlacesAutocomplete', 'ui.bootstrap', 'ngAnimate', 'colorpicker.module','weeklyScheduler'])

.directive("addTripForm", function () {
  return {
      restrict: 'E',
      template: '<div>This is a snippet</div>',
      replace: true
  };
})

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_dash_board', {
    templateUrl: 'view_dash_board/view_dash_board.html',
    controller: 'ViewDashBoardCtrl'
  });
}])

.controller('ViewDashBoardCtrl', ['$scope', 'filterFilter', 'moment','calendarConfig', 'CommonProp', '$firebaseArray', '$firebaseObject', '$timeout', '$firebaseStorage',function($scope,filterFilter, moment, calendarConfig, CommonProp, $firebaseArray, $firebaseObject,$timeout,$firebaseStorage) {

var actions = [ 
  {
  label: '<i class=\'glyphicon glyphicon-remove\'></i>',
  onClick: function(args) {
    calendarTrips.child(args.calendarEvent.Id).remove();
  }
}];
  
//retrieve events from firebasearray


var calendarEvents ;

var vm= $scope;

vm.trips = [];
vm.states = ['South Asia and the Middle East', 'South East Asia', 'North Asia', 'Rest of the world', 'Onshore'];

vm.filtersRegion = [];
vm.filtersUser= [];

vm.regionList =[];

vm.events =[];
vm.users =[];
vm.eventTypes =[];
vm.travelItinerary = [];
vm.listOfMonths =['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var calendarTrips ;
var calendarUsers ;
var travelItinerary ;

vm.init = function () {
  
  vm.filterDateMode ='upcoming'
  vm.showByOption='None'
  //check if online then get data from database otherwise get the localStorage
  if(checkIfOnline()) {

    travelItinerary = firebase.database().ref('TravelItinerary')

    travelItinerary.on("value", function(snapshot){
      vm.$applyAsync(function () {
        vm.travelItinerary = [];
        snapshot.forEach(function(childSnapshot){
          vm.travelItinerary.push({
            Id: childSnapshot.key,
            endsAt: new Date (childSnapshot.val().endsAt),
            startsAt: new Date (childSnapshot.val().startsAt),
          })
        })
        vm.travelItinerary.sort(function(a, b){return a.startsAt - b.startsAt})
      })
    })

    localStorage['travelItinerary'] = JSON.stringify(travelItinerary)

    calendarUsers = firebase.database().ref('Users')
    calendarUsers.on("value", function(snapshot){
      vm.$applyAsync(function () {
        vm.users = [];
        snapshot.forEach(function(childSnapshot){
          vm.users.push({
            Id: childSnapshot.key,
            email: childSnapshot.val().email,
            fullName: childSnapshot.val().firstname + ' ' +childSnapshot.val().lastname,
            phoneNumber: childSnapshot.val().phoneNo
          })
        })
      })
      console.log(vm.users)
    })
    localStorage['calendarUsers'] = JSON.stringify(calendarUsers)

    calendarEvents = firebase.database().ref('Events')
    calendarEvents.on("value",function(snapshot){
      vm.$applyAsync(function () {
        vm.events = [];
        snapshot.forEach(function(childSnapshot){
          vm.events.push({
            Id: childSnapshot.key,
            title: childSnapshot.val().title?childSnapshot.val().title:'N/A',
            location: childSnapshot.val().location?childSnapshot.val().location:'N/A',
            startsAt: childSnapshot.val().startsAt? new Date(childSnapshot.val().startsAt):'N/A',
            endsAt: childSnapshot.val().endsAt?new Date(childSnapshot.val().endsAt):'N/A',
            users: childSnapshot.val().users?childSnapshot.val().users:[],
            trip: childSnapshot.val().trip,
            flightDetail: childSnapshot.val().flightDetail?childSnapshot.val().flightDetail:'N/A',
            airline: childSnapshot.val().airline?childSnapshot.val().airline:'N/A',
            hotel: childSnapshot.val().hotel?childSnapshot.val().hotel:'N/A',
            expand: false
          })
        })
        vm.events.sort(function(a, b){return a.startsAt - b.startsAt})
      })
    })
    localStorage['calendarEvents'] = JSON.stringify(calendarEvents)

    calendarTrips =firebase.database().ref('Trips')
    calendarTrips.on("value", function(snapshot) {
      vm.$applyAsync(function () {
        vm.filtersRegion = []
        vm.regionList = []
        vm.trips = []

        //move this to another class
        snapshot.forEach(function(childSnapshot) {
          if(!vm.regionList.includes(childSnapshot.val().region)){
            vm.regionList.push(childSnapshot.val().region)
            vm.filtersRegion.push({
              value: childSnapshot.val().region,  
              locations: [childSnapshot.val().location]
            })
          }
          else{
            vm.filtersRegion.forEach(function(element){
              if(childSnapshot.val().region === element.value){
                element.locations.push(childSnapshot.val().location)
              }
            })
          }

          vm.trips.push({
            Id: childSnapshot.key,
            location: childSnapshot.val().location,
            color: calendarConfig.colorTypes.important,
            budget: childSnapshot.val().budget,
            budgetUsed: childSnapshot.val().budgetUsed,
            startsAt: new Date(childSnapshot.val().startsAt),
            endsAt: new Date(childSnapshot.val().endsAt),
            draggable: true,
            resizable: true,
            actions: actions,
            events: childSnapshot.val().events,
            attachments: childSnapshot.val().attachments,
            expand: false,
            users: childSnapshot.val().users,
            travelItinerary: childSnapshot.val().travelItinerary
          })
          vm.trips.sort(function(a, b){return a.startsAt - b.startsAt})
            // var localSchedules = []
            // localSchedules.push({
            //   start: moment(childSnapshot.val().startsAt).toDate(),
            //   end: moment(childSnapshot.val().endsAt).toDate()
            // })
        });
      })
    })
    localStorage['calendarTrips'] = JSON.stringify(calendarTrips)

    console.log(vm.trips)
    
  } else {
    travelItinerary = JSON.parse(localStorage['travelItinerary'])
    calendarTrips = JSON.parse(localStorage['calendarTrips'])
    calendarEvents = JSON.parse(localStorage['calendarEvents'])
    calendarUsers = JSON.parse(localStorage['calendarUsers'])
  }
  vm.selectedType ='TravelItinerary'
  setTimeout(function(){window.addeventatc.refresh();},200)
  

};



vm.init();



vm.collapseOpen = function(event) {
  if(event.expand){
    event.expand = false
  } else {
    event.expand = true
  }
  setTimeout(function(){window.addeventatc.refresh();},100)
};

vm.collapseOpenFilter = function(event) {
  if(document.getElementById('collapse'+event).style.display=== "none"){
    document.getElementById('collapse'+event).style.display ="block"
  } else {
    document.getElementById('collapse'+event).style.display ="none"
  }
};

vm.backToTrips = function() {
  vm.selectedType ="Trips"
};

vm.openMap= function(event) {
  var geocoder = new google.maps.Geocoder();
  var address = event;
  var latitude;
  var longitude;

  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
    } 
    var center = new google.maps.LatLng(+latitude, +longitude);

    $scope.Style = "map";
    
    var mapOptions = {
        zoom: 15,
        center: center,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
     var marker = new google.maps.Marker( {position: center, map: $scope.ma} );
     marker.setMap( $scope.map );
  
    $scope.ResizeMap = function(){
        $scope.Style = "mapLarge";
        google.maps.event.trigger($scope.map, 'resize');
        $scope.map.setCenter(marker.position);
    }
    vm.$applyAsync(function () {
    $("#mapModal").modal()})
  }); 
};



vm.isSelectedValid = true
vm.selectedUserList = []
vm.removeUserFromSelectList=function (event) {
  var index =vm.selectedUserList.indexOf(event)
  if(index>-1) {
    vm.selectedUserList.splice(index, 1);
  }
}

vm.selectedList = function(addItem){
  
  if(addItem){
    var newUser ={
      email: addItem.email,
      fullName: addItem.fullName
    }
    if(!vm.selectedUserList) {
      vm.selectedUserList =[]
    }
    if (vm.selectedUserList.filter(item=> item.email == newUser.email).length === 0){
      vm.selectedUserList.push(newUser);
      
    } else {
      vm.isSelectedValid = false
    }
  } else {
    vm.isSelectedValid = false
  }
  document.getElementById('UserInput').value = null
  
}

vm.selectTravelItinerary
vm.selectedTrip;
vm.selectedUsers;


vm.showUsers = function(element) {
  vm.isSelectedUser = true
}

vm.showMoreTrips = function(event) {
  vm.selectedType ='Trips'
  vm.selectTravelItinerary = event
  vm.isSelectedTrip = true
  vm.selectedTrips =[]
  vm.trips.forEach(function(childSnapshot){
    if(childSnapshot.travelItinerary){
      if(childSnapshot.travelItinerary == vm.selectTravelItinerary.Id){
        vm.selectedTrips.push({
          Id: childSnapshot.Id,
          location: childSnapshot.location,
          color: calendarConfig.colorTypes.important,
          budget: childSnapshot.budget,
          budgetUsed: childSnapshot.budgetUsed,
          startsAt: childSnapshot.startsAt,
          endsAt: childSnapshot.endsAt,
          actions: actions,
          events: childSnapshot.events,
          attachments: childSnapshot.attachments,
          expand: false,
          users: childSnapshot.users
        })
      }
    }
  })
}

vm.showMore = function(event) {
  vm.selectedType ='Events'
  vm.used = 0;
  vm.selectedTrip = event

    vm.selectedEvents =[]
    vm.events.forEach(function(snapshot){
      if(snapshot.trip == vm.selectedTrip.Id){

        vm.selectedEvents.push({
          Id: snapshot.Id,
          title: snapshot.title,
          location: snapshot.location,
          startsAt: snapshot.startsAt,
          endsAt: snapshot.endsAt,
          flightDetail: snapshot.flightDetail,
          airline: snapshot.airline,
          hotel: snapshot.hotel,
          users: snapshot.users,
          from: snapshot.from,
          to: snapshot.to,
          type: snapshot.type,
          seat: snapshot.seat,
          // number: snapshot.val().number.length !== 0 ?snapshot.val().number:null,
        })
      }
    })
    if(event.users){
      vm.selectedUsers=event.users
      vm.selectedUsers.forEach(function(snapshot) {
        snapshot.expand = false
      })
    }
};

vm.checkIfInEmail = function(list,item) {
  var result = false;
  if(list){
    vm.trips.forEach(function(snapshot){
      if(snapshot.travelItinerary === list.Id){
        if(snapshot.users){
          if(snapshot.users.map( x => x.email).includes(item)){
            result = true
          }
        }
        
      }
      

    })
  }
  return result
}

vm.checkIfInMonth = function(month,item) {
  var result = false;

  const itemIndex = item.getMonth()
  if(vm.listOfMonths[itemIndex]===month){
    result = true
    
  }
  return result
}

vm.checkIfInEmailForTrip =function (list,item) {
  var result = false;
  if(list){
    if(list.users){
      if(list.users.map( x => x.email).includes(item)){
        result = true
      }
    }
  }
  return result
}

vm.dateFilter = function (item) { 

  if(vm.filterDateMode==='upcoming') {
    if(item.endsAt> new Date()){
      return item
    }
  } else if(vm.filterDateMode==='past') {
    if(item.endsAt< new Date()){
      return item
    }
  } else {
    return item
  }
};


function isFuture(value) {
  return value > new Date();
}

function isPast(value) {
  return value < new Date();
}

vm.filterRegionIncluded=[];
vm.filterUserIncluded=[];

vm.includeUserFilter = function(item) {
  var i = $.inArray(item, vm.filterUserIncluded);
    if (i > -1) {
      vm.filterUserIncluded.splice(i, 1);
    } else {
      vm.filterUserIncluded.push(item);
    }
    let localTrips = []

    vm.filterUserIncluded.forEach(function(element) {
      vm.trips.forEach(function(snapshot) {
        snapshot.users.forEach(function(childSnapshot) {
          if(childSnapshot.email === element) {
            localTrips.push(snapshot)
          }
        })
      })
    })
    if(localTrips.length>0) {
      vm.trips = localTrips
    }
};

vm.availableOptions =['None','Staff','Month']

vm.addEvent = function(event){
  vm.selectedList(vm.selectedUser)
  var newEvent = {
    title: event.title ? event.title:'N/A',
    startsAt: event.startsAt?event.startsAt.toString():'N/A',
    endsAt: event.endsAt?event.endsAt.toString():'N/A',
    location: event.location? event.location:'N/A',
    users: vm.selectedUserList?vm.selectedUserList:'N/A',
    airline: event.airline? event.airline : 'N/A',
    budgetUsed:[],
    flightDetail: event.flightDetail ? event.flightDetail : 'N/A',
    airline: event.airline ? event.airline : 'N/A',
    hotel: event.hotel ? event.hotel : 'N/A',
    trip: vm.selectedTrip.Id,
    draggable: true,
    resizable: true
  }
  try{
    vm.events.push(newEvent);
    if(vm.selectedEvents){
      vm.selectedEvents.push(newEvent)
    }
    calendarEvents.push(newEvent);
    vm.selectedUserList=[];
    document.getElementById("inputTitle1").value='';
    document.getElementById("inputLocation1").value='';
    document.getElementById("inputDescription1").value='';
    document.getElementById("inputHotel").value='';
    alert('Succesfully create a new event')
  } catch(err) {
    alert('Cannnot create new event due to'+ err)
  }
};

vm.addTravelItinerary= function(newTravelItinerary) {
  var TravelItinerary = {
    startsAt: newTravelItinerary.startsAt ? newTravelItinerary.startsAt.toString() :'N/A',
    endsAt: newTravelItinerary.endsAt ?newTravelItinerary.endsAt.toString() :'N/A',
  }
  try{
    travelItinerary.push(TravelItinerary);
    vm.travelItinerary.push(TravelItinerary);
    document.getElementById("newTravelItineraryForm").reset();
    alert('Succesfully create a new Travel Itinerary')
  } catch(err) {
    alert('Cannnot create new Travel Itinerary due to'+ err)
  }
  
};

vm.addTrip = function(newEvent) {
  
  vm.selectedList(vm.selectedUser)
  var newTrip = {
    location: newEvent.location ? newEvent.location:'N/A',
    startsAt: newEvent.startsAt ? newEvent.startsAt.toString() :'N/A',
    endsAt: newEvent.endsAt ?newEvent.endsAt.toString() :'N/A',
    budgetUsed:[],
    draggable: false,
    resizable: false,
    events: [],
    users: vm.selectedUserList,
    travelItinerary: vm.selectTravelItinerary.Id
  }
  try{
    calendarTrips.push(newTrip);
    vm.selectedTrips.push(newTrip);
    vm.selectedUserList=[];
    vm.selectedUser=null;
    vm.trips.push(newTrip);
    document.getElementById("inputLocation1").value='';
    alert('Succesfully create a new trip')
  } catch(err) {
    alert('Cannnot create new trip due to: '+ err)
  }
  
};


vm.editTravelItinerary = function (value){
  try{
    vm.travelItinerary[value.Id]=value
    travelItinerary.child(value.Id).update({
      startsAt: value.startsAt ? value.startsAt.toString() :'N/A',
    endsAt: value.endsAt ?value.endsAt.toString() :'N/A',
    });
    document.getElementById("editTravelItinerary").reset();
    alert('Succesfully save Travel Itinerary')
  } catch(err) {
    alert('Cannnot save Itinerary due to: '+ err)
  }
};

vm.editTrip = function (value){
  try{
    vm.trips[value.Id] = value
    calendarTrips.child(value.Id).update({
      location: value.location ? value.location:'N/A',
      startsAt: value.startsAt ? value.startsAt.toString() :'N/A',
      endsAt: value.endsAt ?value.endsAt.toString() :'N/A',
      users: vm.selectedUserList
    });
    document.getElementById("editTripForm").reset();
    alert('Succesfully Save Travel Itinerary')
  } catch(err) {
    alert('Cannnot Save Trip due to: '+ err)
  }
};

vm.editEvent = function (value) {
  try{
    vm.events[value.Id]=value
    calendarEvents.child(value.Id).update({
      title: value.title,
      airline: value.airline? value.airline : 'N/A',
      flightDetail: value.flightDetail ? value.flightDetail : 'N/A',
      hotel: value.hotel ? value.hotel : 'N/A',
      location: value.location ? value.location:'N/A',
      startsAt: value.startsAt ? value.startsAt.toString() :'N/A',
      endsAt: value.endsAt ?value.endsAt.toString() :'N/A',
      users: vm.selectedUserList
    });
    document.getElementById("editEventForm").reset();
    alert('Succesfully save Travel Itinerary')
  } catch(err) {
    alert('Cannnot save Event due to: '+ err)
  }
}


let deletedObject;
let deleteFromList;
let addUser;

vm.openAddOrEditModal = function (value,type,modalTitle) {
  vm.modalTitle =modalTitle
  vm.modalContent = type
  if(type==='/editTravelItineraryForm.html'){
    vm.editedTravelItinerary = value
    $("#addOrEditModal").modal()
  } else if(type==='/editTripForm.html'){
    vm.selectedUserList =value.users!=='N/A'? value.users:[] 
    vm.editedTrip = value
    $("#addOrEditModal").modal()
  } else if(type==='/editEventForm.html'){
    vm.selectedUserList =value.users!=='N/A'? value.users:[] 
    vm.editedEvent = value
    $("#addOrEditModal").modal()
  } else if (type ==='deleteTravelItinerary'){
    deletedObject = value
    deleteFromList = travelItinerary
    $("#deleteModal").modal()
  } else if (type ==='deleteTrip'){
    deletedObject = value
    deleteFromList = calendarTrips
    $("#deleteModal").modal()
  } else if (type ==='deleteEvent'){
    deletedObject = value
    deleteFromList = calendarEvents
    $("#deleteModal").modal()
  }
   else {
    $("#addOrEditModal").modal()
  }
};

let selectedEventToRemoveFrom;
let deleteUser;
vm.removeUserFromEvent = function (list,item) {
  selectedEventToRemoveFrom = list
  deleteUser = item
  vm.modalContent= 'deleteUser'
  $("#deleteModal").modal()
  vm.selectedType==='TravelItinerary'
};

vm.deleteItem = function (){
  if(vm.modalContent ==='deleteTravelItinerary'){
    vm.trips.forEach(function(trip){
      vm.events.forEach(function(event){
        if(event.trip===trip.Id){
          calendarEvents.child(event.Id).remove()
          var index = vm.events.indexOf(trip.Id)
          if (index > -1) {
            vm.events.splice(index, 1);
          }
        }
      })
      if(trip.travelItinerary===deletedObject.Id){
        calendarTrips.child(trip.Id).remove()
        var index = vm.trips.indexOf(trip)
        if (index > -1) {
          vm.trips.splice(index, 1);
        }
      }
    })
    travelItinerary.child(deletedObject.Id).remove()
    var index = vm.travelItinerary.indexOf(deletedObject)
    if (index > -1) {
      vm.travelItinerary.splice(index, 1);
    }
  }
  else if(vm.modalContent ==='deleteTrip'){
    vm.events.forEach(function(event){
      if(event.trip===deletedObject.Id){
        calendarEvents.child(event.Id).remove()
        var index = vm.events.indexOf(event)
        if (index > -1) {
          vm.events.splice(index, 1);
        }
      }
    })
    calendarTrips.child(deletedObject.Id).remove()
    var index = vm.trips.indexOf(deletedObject)
    if (index > -1) {
      vm.trips.splice(index, 1);
    }

    var index = vm.selectedTrips.indexOf(deletedObject)
    if (index > -1) {
      vm.selectedTrips.splice(index, 1);
    }
    
  }
  else if(vm.modalContent ==='deleteEvent'){
    calendarEvents.child(deletedObject.Id).remove()
    var index = vm.events.indexOf(deletedObject)
    if (index > -1) {
      vm.events.splice(index, 1);
    }
    var index2 = vm.selectedEvents.indexOf(deletedObject)
    if (index2 > -1) {
      vm.selectedEvents.splice(index, 1);
    }
    
  }
  else if(vm.modalContent ==='deleteUser'){
    var index = selectedEventToRemoveFrom.users.indexOf(deleteUser)
    if (index > -1) {
      selectedEventToRemoveFrom.splice(index, 1);
    }
    calendarEvents.child(selectedEventToRemoveFrom.Id).update({
      users: selectedEventToRemoveFrom
    })
  }
  vm.selectedType==='TravelItinerary'
};

function search(emailKey, myArray){
  for (var i=0; i < myArray.length; i++) {
      if (myArray[i].email === emailKey) {
          return myArray[i];
      }
  }
};

vm.currentDate = new Date();

function saveData(data, root) {
  const ref = firebase
    .database()
    .ref(root);

  return ref.set(data)
    .then(
      () => {
          ref.onDisconnect().cancel(); 
        // Success callback is always executed (even in offline mode).
      },
      reason => {
        // Error callback is never executed for some reason :-(
      }
    );
};

function checkIfOnline() {
  console.log(navigator.onLine)
  return navigator.onLine;
};
 
}]);

