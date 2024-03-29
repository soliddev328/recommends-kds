import { Component,ViewChild, OnInit,ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';
import {UrlConstants} from '../constants/UrlConstants';
import {ReviewsService} from '../add-review/reviews.service';
import {ENTITY_TYPES_ENUM, TYPES_ENUM } from '../constants/VenueConstants';
import {ANALYTICS_ENTITY_TYPES_ENUM, INTERFACE_ENUM, ACTION} from '../constants/AnalyticsConstants';

import {CampErrorMessage, CampConstants } from '../constants/CampConstants';
import { MatTabChangeEvent } from '@angular/material';
declare let ga: any;
@Component({
  selector: 'app-camps',
  templateUrl: './camps.component.html',
  styleUrls: ['./camps.component.css']
})
export class CampsComponent implements OnInit {
  camp_id: string;
  camp: any;
  isLoaded: boolean = false;
  public is_parent_id: Boolean;
  public is_review_click:Boolean;
  public isErrorVisible: Boolean;
  public isSuccessVisible: Boolean;
  public errorMessage: String;
  public review: string;
  public user_reviews: any;
  public parent_id: any;
  public category: string;
  public campStatus: Boolean;
  public campErrorMessage = new CampErrorMessage();
  public campConstants: any;
  public isSaveVisible: Boolean;
  public reviews_present: Boolean;
  public URLConstatnts = new UrlConstants();
  selectedIndex;

  @ViewChild('reviewsInput')
  reviewsInput: ElementRef;
  class: any = false;
  constructor(private route: ActivatedRoute, private http: HttpClient, private titleService: Title,
    private metaService: Meta, private reviewService: ReviewsService) { }

  ngOnInit() {
    this.is_parent_id = false;
    this.parent_id = '';
    this.camp_id = this.route.snapshot.params['id'];
    this.parent_id = this.route.snapshot.queryParams['parent_id'];
    this.is_parent_id = this.parent_id !== undefined && this.parent_id !== '';
    this.is_save_action();
    this.get_camp_details();
    this.is_review_click = false;
    this.isErrorVisible = false;
    this.isSuccessVisible = false;
    this.errorMessage = '';
    this.review = '';
    this.camp  = [];
    this.user_reviews = [];
    this.reviews_present = false;
    this.category = '';
    this.camp.name = '';
    this.camp.image_url = '';
    this.category = '';
    this.campStatus = false;
    this.campConstants = new CampConstants();
    this.selectedIndex = 0;
    this.isSaveVisible = false;
    this.get_reviews();
      this.add_analytics_data('CLICK');
  }
  get_camp_details() {
    let url = this.URLConstatnts.API_URL + 'camps/' + this.camp_id+"/";
 
    const headers = new HttpHeaders();
        this.http.get(url, { headers: headers, responseType: 'text' }).subscribe(data => {
          data = data.replace(/\n/g, "");
          data = JSON.parse(data);
          if (data['status']) {
            this.campStatus = true;
            this.camp = data["data"]['0'];
          if (this.camp.category !== undefined && this.camp.category > 0) {

          this.category = this.campConstants.CAMP_CATEGORY.find(x=>x.id ==this.camp.category).name;
         } else {
          this.category ='No information available for now';
          }
          this.camp.lunch = this.camp.misc['lunch'];
          this.camp.tips = this.camp.misc['tips'];
          this.camp.am_extended_care = this.camp.misc['am_extended_care'];
          this.camp.pm_extended_care = this.camp.misc['pm_extended_care'];
          this.camp.image_url  = this.camp.image_url;
          this.camp.timings = this.camp.misc['timings'];
          this.isLoaded = true;
            this.titleService.setTitle(this.camp.name);
            this.metaService.addTag({ name: 'description', content: this.camp.description });

            // OG meta properties
            this.metaService.addTag({ property: 'og:title', content: this.camp.name });
            this.metaService.addTag({ property: 'og:description', content: this.camp.description });
            this.metaService.addTag({ property: 'og:image', content: this.camp.image_url });
            this.metaService.addTag({ property: 'og:url', content: 'https://kinparenting.com/camps/' + this.camp_id });
            this.metaService.addTag({ property: 'og:site_name', content: 'Kin Parenting' });
        } else{
          alert('No camp information available for now');
        }
      })

  }
  show_reviews(event: MatTabChangeEvent) {
 
    let tab = event.tab;
    let index = event.index;
    if (index === 1 && this.user_reviews.length === 0) {
      this.reviewService.get_reviews_by_type(TYPES_ENUM.CAMP , true, this.camp_id).subscribe(data => {
        if ( data['status'] ) {
          this.user_reviews = data['data'];
          this.reviews_present = true;
        } else {
          this.user_reviews = [];
          this.reviews_present = false;
        }
      }, error => {
       // alert(this.campErrorMessage.GET_DATA_ERROR);
      });
    }
  }

  camp_redirect() {
    ga('send', 'camp', {
      eventCategory: 'Clicks',
      eventLabel: 'More Details',
      eventAction: 'Click on more details button',
      eventValue: this.camp_id
    });
    window.open(this.camp.url);
  }

  add_review_redirect(index: number): void {
    if (this.parent_id !== undefined) {
       this.is_parent_id = true;
       this.is_review_click = true;
       this.selectedIndex = index;
       this.reviewsInput.nativeElement.scrollIntoView({behavior: 'smooth'});
     }
  }

  add_review() {
    if (this.validate_review()) {
      let input_data = {
        'input' : {
          'entity_type' : ENTITY_TYPES_ENUM.CAMP,
          'entity_id' : this.camp_id,
          'parent_id' : this.parent_id,
          'review' : this.review,
          'is_approved' : false
        }

      };
      this.reviewService.add_review(input_data).subscribe(data => {
        if (data['status'] === true) {
          this.isSuccessVisible = true;
          this.isErrorVisible = false;
          setTimeout(()=> {    
                this.isSuccessVisible = false;
                this.review = '';
           }, 3000);

          this.errorMessage = this.campErrorMessage.REVIEW_ADDED_SUCCESS;
        } else {
          this.isErrorVisible = true;
          this.errorMessage = this.campErrorMessage.ERROR_ADDING_NEW_REVIEW;
        }
      }, error => {
        this.isErrorVisible = true;
        this.errorMessage = this.campErrorMessage.SOMETHING_WENT_WRONG;
      });


    }
  }
  get_reviews() {
    if (this.user_reviews.length === 0) {
      this.reviewService.get_reviews_by_type('hiking_trail', true, this.camp_id).subscribe(data => {
        console.log(data);
        if ( data['status'] ) {
          this.reviews_present = true;
          this.user_reviews = data['data'];
        } else {
          this.reviews_present = false;
          this.user_reviews = [];
        }
      }, error => {
       // alert(this.trailErrorMessage.GET_DATA_ERROR);
      });
    }
  }
  validate_review() {
    if (this.review.trim().length === 0) {
      this.isErrorVisible = true;
      this.errorMessage = 'Review is required';
      setTimeout(()=> {    
        this.isErrorVisible  = false;
      }, 3000);
      return false;
    }
    this.isErrorVisible = false;
    return true;
  }

  format_age() {
    if(this.camp.min_age == 0 && this.camp.max_age == 99) {
      return "Good for all ages";
    }
    if(this.camp.min_age != 0 && this.camp.max_age == 99) {
      return "Good for " + this.camp.min_age + " years and above";
    }
    else {
      return "Good for " + this.camp.min_age + " to " + this.camp.max_age + " years";
    } 
  }

    format_time(timeString) {
    var H = +timeString.substr(0, 2);
    var h = H % 12 || 12;
    var ampm = (H < 12 || H === 24) ? "AM" : "PM";
    timeString = h + timeString.substr(2, 3) + ampm;
    return timeString;
  }

  calendar_redirects() {
    this.add_analytics_data('CALENDAR');
    window.open('https://calendar.google.com');
  }

  save_camp() {
    if (this.parent_id !== undefined) {
      this.add_analytics_data('SAVE');
      this.isSaveVisible = true;
   }
  }
  add_analytics_data(atype: any) {
    let action = '';
     switch (atype) {
       case 'CLICK':
       action = ACTION.CLICK;
         break;
       case 'SAVE':
       action = ACTION.SAVE;
         break;
       case 'CALENDAR':
       action = ACTION.CALENDAR;
         break;
     }
     let analytics_input = {};
     if (this.parent_id !== undefined) {
         analytics_input = {
        'input_data' : [ {
         'entity_type' : ANALYTICS_ENTITY_TYPES_ENUM.CAMP,
         'entity_id' : this.camp_id,
         'interface' : INTERFACE_ENUM.FE,
         'parent_id' : this.parent_id,
         'action' : action,
         'referrer' : '/root/home'
        } ]
      };
    } else {
        analytics_input = {
        'input_data' : [ {
         'entity_type' : ANALYTICS_ENTITY_TYPES_ENUM.CAMP,
         'entity_id' : this.camp_id,
         'interface' : INTERFACE_ENUM.FE,
         'action' : action,
         'referrer' : '/root/home'
        } ]
      };
    }
     this.reviewService.add_analytics_actions(analytics_input).subscribe(data => {
      if (this.parent_id !== undefined && atype === 'CLICK') {
        this.is_save_action();
        this.is_parent_id = true;
     }
     }, error => {
     });
 
   }

   is_save_action() {
    this.reviewService.verify_save_action(this.parent_id, ANALYTICS_ENTITY_TYPES_ENUM.CAMP, this.camp_id).subscribe(data => {
      if (data['status'] === true) {
        this.isSaveVisible = true;
      } else {
        this.isSaveVisible = false;
      }
    }, error => {
    });
  }
  addReviewSection(event){
    console.log(event);
    if(event == false){
      this.class = true;
    }else{
      this.class = false;
    }
    
  }

}
