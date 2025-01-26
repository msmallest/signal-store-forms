import { Component, effect, inject, viewChild } from '@angular/core';
import { BooksStore } from './template-driven-form.store';
import { JsonPipe } from '@angular/common';
import {FormsModule, NgForm, ReactiveFormsModule} from '@angular/forms';
import { tap } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { ReactiveFormStore } from './reactive-forms.store';
import { ReactiveFormsArrayComponent } from "./reactive-forms-array.component";
import { FormEventsProfilerTestComponent } from "./form-events-profiler-test.component";
import { ProfilerSingularEventsComponent } from "./profiler-singular-events.component";
import { WithFormDataFeatureComponent } from "./with-form-data-feature.component";
import { ArrayOfChildrenComponent } from "./data-store-test/array-of-children.component";

@Component({
  selector: 'app-root',
  imports: [JsonPipe, FormsModule, ReactiveFormsModule, ReactiveFormsArrayComponent, FormEventsProfilerTestComponent, ProfilerSingularEventsComponent, WithFormDataFeatureComponent, ArrayOfChildrenComponent],
  template: `
  <app-array-of-children />
  <!-- <app-with-form-data-feature /> -->
  <!-- <app-profiler-singular-events /> -->
    <!-- <app-form-events-profiler-test />
  <hr />
    <app-reactive-forms-array />

    <hr />

    <form #myForm="ngForm">
        <input [(ngModel)]="form.firstName" name="firstName" required/>
        <input [(ngModel)]="form.lastName" name="lastName"/>
        <input [(ngModel)]="form.signedTOS" type="checkbox" name="signedTOS"/>
    </form> -->
    
    <!-- <pre>{{form.firstName() | json}}</pre>
    <pre>{{form.lastName() | json}}</pre>
    <pre>{{form.signedTOS() | json}}</pre>
    <pre>valid: {{formData().valid}}</pre>
    <pre>valid in store: {{bookStore.valid()}}</pre> -->

    <hr />

    <!-- <form [formGroup]="reactiveForm">
        <input formControlName="firstName" />
        <input formControlName="lastName" />
        <input formControlName="signedTOS" />
    </form>

    <pre>reactive form val: {{reactiveForm.getRawValue() | json}}</pre>
    <pre>formEventData: {{reactiveStore.formEventData() | json}}</pre> -->
  `
})
export class AppComponent {
    bookStore = inject(BooksStore)

    form = this.bookStore.form;

    // formData = viewChild.required<NgForm>('myForm');

    // syncNgFormMetadataEffect = effect(() => {
    //     this.formData().form.events.pipe(
    //         tap(() => {
    //             console.log(this.formData().form)
    //         })
    //     ).subscribe()

    //     this.formData().form.statusChanges.pipe(
    //         tap((s) => {
    //             const _valid = s === 'VALID';
    //             this.bookStore.setValidity(_valid)
    //         })
    //     ).subscribe()
    // })

    reactiveStore = inject(ReactiveFormStore)
    reactiveForm = this.reactiveStore.form;
}
