import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HousingService } from '../housing.service';  // Ajuste o caminho se necessário
import { Housinglocation } from '../housinglocation';  // Ajuste o caminho se necessário
import { FormControl, FormGroup } from '@angular/forms';
import { DetailsModule } from './details.module';

@Component({
  selector: 'app-details',
  styleUrls: ['./details.component.css'],
  template: `
  <article>
    <img class="listing-photo" [src]="housingLocation?.photo"
      alt="Exterior photo of {{housingLocation?.name}}"/>
    <section class="listing-description">
      <h2 class="listing-heading">{{housingLocation?.name}}</h2>
      <p class="listing-location">{{housingLocation?.city}}, {{housingLocation?.state}}</p>
    </section>
    <section class="listing-features">
      <h2 class="section-heading">About this housing location</h2>
      <ul>
        <li>Units available: {{housingLocation?.availableUnits}}</li>
        <li>Does this location have wifi: {{housingLocation?.wifi}}</li>
        <li>Does this location have laundry: {{housingLocation?.laundry}}</li>
      </ul>
    </section>
    <form [formGroup]="applyForm" (ngSubmit)="submitApplication()">
      <label>
        First Name:
        <input formControlName="firstName" />
      </label>
      <label>
        Last Name:
        <input formControlName="lastName" />
      </label>
      <label>
        Email:
        <input formControlName="email" type="email" />
      </label>
      <button type="submit">Submit Application</button>
    </form>
  </article>
  `,
})
export class DetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  housingService = inject(HousingService);
  housingLocation: Housinglocation | undefined;

  applyForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('')
  });

  ngOnInit() {
    const housingLocationId = Number(this.route.snapshot.params['id']);
    this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
  }

  submitApplication() {
    this.housingService.submitApplication(
      this.applyForm.value.firstName ?? '',
      this.applyForm.value.lastName ?? '',
      this.applyForm.value.email ?? ''
    );
  }
}