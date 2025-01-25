import { Component, effect, inject, viewChild } from '@angular/core';
import { BooksStore } from './template-driven-form.store';
import { JsonPipe } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import { tap } from 'rxjs';
import { patchState } from '@ngrx/signals';

@Component({
  selector: 'app-root',
  imports: [JsonPipe, FormsModule],
  template: `
    <form #myForm="ngForm">
        <input [(ngModel)]="form.firstName" name="firstName" required/>
        <input [(ngModel)]="form.lastName" name="lastName"/>
        <input [(ngModel)]="form.signedTOS" type="checkbox" name="signedTOS"/>
    </form>
    
    <pre>{{form.firstName() | json}}</pre>
    <pre>{{form.lastName() | json}}</pre>
    <pre>{{form.signedTOS() | json}}</pre>
    <pre>valid: {{formData().valid}}</pre>
    <pre>valid in store: {{bookStore.valid()}}</pre>
  `
})
export class AppComponent {
    bookStore = inject(BooksStore)

    form = this.bookStore.form;

    formData = viewChild.required<NgForm>('myForm');

    syncNgFormMetadataEffect = effect(() => {
        // this.formData().form.events.pipe(
        //     tap(() => {
        //         console.log(this.formData().form)
        //     })
        // ).subscribe()

        this.formData().form.statusChanges.pipe(
            tap((s) => {
                const _valid = s === 'VALID';
                this.bookStore.setValidity(_valid)
            })
        ).subscribe()
    })
}
