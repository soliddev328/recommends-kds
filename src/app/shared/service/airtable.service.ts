import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AIRTABLE_API_URL } from "@shared/constants/UrlConstants";
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, empty, } from 'rxjs'


@Injectable({
    providedIn: 'root'
})
export class AirtableService {
    constructor(
        private http: HttpClient,
    ) { }
   
    gethttpOptions() {
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                "Authorization": `Bearer keySUdow4cQ8fUlHf`
            })
        };
        return httpOptions;
    }

    // get recos by category 
    getRecosByCategory(category: string) {
        return this.http.get(AIRTABLE_API_URL + "Recos?filterByFormula=Category+%3D+%22" + encodeURIComponent(category) + "%22", this.gethttpOptions());
    }

    // get recos by recommender
    getRecos(recommender: string) {
        return this.http.get(AIRTABLE_API_URL + "Recos?filterByFormula=Recommender+%3D+'" + recommender + "'", this.gethttpOptions());
    }

    // get friends
    getFriends(parent_id: string) {
        return this.http.get(AIRTABLE_API_URL + "Parents?fields%5B%5D=Friends&filterByFormula=KinId+%3D+'" + parent_id + "'", this.gethttpOptions());
    }

}