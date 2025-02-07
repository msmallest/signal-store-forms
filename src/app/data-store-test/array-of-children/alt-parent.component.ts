import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import {signalStore, withHooks, withMethods, withProps} from '@ngrx/signals';
import { withFormState } from '../../form-data.store.feature';
import { tap } from 'rxjs';
import { JsonPipe } from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ChildComponent } from "./child.component";
import { rxEffect } from 'ngxtension/rx-effect';
import {MyformserviceService} from './myformservice.service';
import {AltChildComponent} from './alt-child.component';

@Component({
  selector: 'app-alt-parent',
  imports: [ReactiveFormsModule, JsonPipe, MatFormFieldModule, MatInputModule, ChildComponent, AltChildComponent, FormsModule],
  template: `
    <mat-form-field>
      <mat-label>New Book Name</mat-label>
      <input matInput [(ngModel)]="newBook" />
    </mat-form-field>
    <button (click)="form.controls.books.push(fb.group({title: newBook()}))">Add Book</button>
    <form [formGroup]="form">
        <mat-form-field>
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName"/>
        </mat-form-field>

        <mat-form-field>
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName"/>
        </mat-form-field>

      <hr />

        @for (book of form.controls.books.controls; track $index) {
          <hr />

            <app-alt-child [index]="$index" (delete)="onDelete($event)" [form]="book"/>
        }
    </form>

    <pre>{{form.getRawValue() | json}}</pre>
  `,
  styles: `

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AltParentComponent {
  formStore = inject(MyformserviceService);
  form = this.formStore.form;
  fb = this.formStore.fb;

  stuff = ['a', 'b', 'c', 'd']

  newBook = linkedSignal(() => 'new')

  onDelete(index: number) {
    this.form.controls.books.removeAt(index)
  }
}
