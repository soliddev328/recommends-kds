import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  registerForm: FormGroup;
  childForm: FormGroup;
  submitted = false;
  public isSuccessVisible: Boolean;
  constructor(private titleService: Title, private formBuilder: FormBuilder, private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.titleService.setTitle('Kin - The Parenting Assistant');
    this.registerForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      zip_code: ['', [Validators.required, Validators.minLength(2)]],
      src: [''],
      src_id: [''],
    });
    this.isSuccessVisible = false;

    /* Initiate the form structure */
    this.childForm = this.fb.group({
      child_array: this.fb.array([this.fb.group({ age: '', nick_name: '', interests: '', parent_id: '', gender: '' })])
    });
  }

  get newChild() {
    return this.childForm.get('child_array') as FormArray;
  }

  /////// This is new /////////////////

  addNewChild() {
    this.newChild.push(this.fb.group({ age: '', nick_name: '', interests: '', parent_id: '', gender: '' }));
  }

  deleteChild(index) {
    this.newChild.removeAt(index);
  }

  //////////// End ////////////////////

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    } else {

      const random = Math.floor(Math.random() * (999999 - 100000)) + 100000;
      this.registerForm.controls['src'].setValue('web');
      this.registerForm.controls['src_id'].setValue(random);
      let data = JSON.stringify(this.registerForm.value);
      data = data.replace(/[\u2018\u2019]/g, '\'')
        .replace(/[\u201C\u201D]/g, '"');
      const url = 'https://kin-api.kinparenting.com/users/';
      const headers = new HttpHeaders()
        .set('x-api-key', 'seDqmi1mqn25insmLa0NF404jcDUi79saFHylHVk')
        .set('Content-Type', 'application/json');
      this.http.post(url, data, { headers: headers, responseType: 'text' }).subscribe(response => {
        data = response.replace(/\n/g, '');
        data = JSON.parse(data);
        const url = 'https://kin-api.kinparenting.com/kids/';
        for (let i = 0; i < this.newChild.length; i++) {
          this.newChild.value[i].parent_id = data['account'].parent_id;
          this.newChild.value[i].gender = 'M';
          const headers = new HttpHeaders()
            .set('x-api-key', 'seDqmi1mqn25insmLa0NF404jcDUi79saFHylHVk')
            .set('Content-Type', 'application/json');
          this.http.post(url, this.newChild.value[i], { headers: headers, responseType: 'text' }).subscribe(response => {
            data = response.replace(/\n/g, '');
            data = JSON.parse(data);

          });
        }
        this.isSuccessVisible = true;
        setTimeout(() => {
          window.location.reload();
          this.isSuccessVisible = false;
        }, 3000);

      });
    }

  }

}
