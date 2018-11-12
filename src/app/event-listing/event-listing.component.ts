import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-listing',
  templateUrl: './event-listing.component.html',
  styleUrls: ['./event-listing.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EventListingComponent implements OnInit {
  events_explore;
  events_today;
  events_tomorrow;
  events_weekend;
  isToday: boolean = false;
  isExplore: boolean = false;
  isTomorrow: boolean = false;
  isWeekend: boolean = false;

  constructor(private route: ActivatedRoute,
              private http: HttpClient,
              private datePipe: DatePipe,
              private router: Router) { }

  ngOnInit() {
    this.get_explore_event_details();
  }

  get_explore_event_details() {
    if(this.events_explore) {
      this.isExplore = true;
    }
    else {
      var d = Date.now();
      let url = "https://kin-api.kinparenting.com/events?event_date_start=" + this.datePipe.transform(d, 'yyyy-MM-dd') + "&event_date_range=30"; 
      const headers = new HttpHeaders()
          .set('x-api-key', 'seDqmi1mqn25insmLa0NF404jcDUi79saFHylHVk');
      this.http.get(url, { headers: headers, responseType: 'text' }).subscribe(data => {
          data = data.replace(/\n/g, "");
          data = JSON.parse(data);
          this.events_explore = data["events"];
          this.isExplore = true;
      })
    }
  }

  get_today_events() {
    if(this.events_today) {
      this.isToday = true;
    }
    else {
      let url = "https://kin-api.kinparenting.com/events?event_range_str=today"; 
      const headers = new HttpHeaders()
          .set('x-api-key', 'seDqmi1mqn25insmLa0NF404jcDUi79saFHylHVk');
      this.http.get(url, { headers: headers, responseType: 'text' }).subscribe(data => {
          data = data.replace(/\n/g, "");
          data = JSON.parse(data);
          this.events_today = data["events"];
          this.isToday = true;
      })
    }
  }

  get_tomorrow_events() {
    if(this.events_tomorrow) {
      this.isTomorrow = true;
    }
    else {
      let url = "https://kin-api.kinparenting.com/events?event_range_str=tomorrow"; 
      const headers = new HttpHeaders()
          .set('x-api-key', 'seDqmi1mqn25insmLa0NF404jcDUi79saFHylHVk');
      this.http.get(url, { headers: headers, responseType: 'text' }).subscribe(data => {
          data = data.replace(/\n/g, "");
          data = JSON.parse(data);
          this.events_tomorrow = data["events"];
          this.isTomorrow = true;
      })
    }
  }

  get_weekend_events() {
    if(this.events_weekend) {
      this.isWeekend = true;
    }
    else {
      let url = "https://kin-api.kinparenting.com/events?event_range_str=weekend"; 
      const headers = new HttpHeaders()
          .set('x-api-key', 'seDqmi1mqn25insmLa0NF404jcDUi79saFHylHVk');
      this.http.get(url, { headers: headers, responseType: 'text' }).subscribe(data => {
          data = data.replace(/\n/g, "");
          data = JSON.parse(data);
          this.events_weekend = data["events"];
          this.isWeekend = true;
      })
    }
  }

  onTabClick(event) {
    this.isExplore = false;
    this.isToday = false;
    this.isTomorrow = false;
    this.isWeekend = false;
    if(event.index == 0) {
      this.get_explore_event_details();
    }
    if(event.index == 1) {
      this.get_today_events();
    }
    if(event.index == 2) {
      this.get_tomorrow_events()
    }
    if(event.index == 3) {
      this.get_weekend_events();
    }
  }
}