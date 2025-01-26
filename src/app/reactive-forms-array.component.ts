import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormArrayStore } from './reactive-forms-array.store';
import { ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-reactive-forms-array',
  imports: [ReactiveFormsModule, JsonPipe],
  template: `
    @let form = formStore.form;
    <button (click)="formStore.addCustomer()">Add Customer</button>
    <form [formGroup]="form">
        <label>Certified Valid</label>
        <input formControlName="certifyValid" type="checkbox" />
        @for (customer of form.controls.customers.controls; track $index) {
            <label>First Name</label>
            <input [formControl]="customer.controls.firstName" />

            <label>Last Name</label>
            <input [formControl]="customer.controls.lastName" />

            <label>ID</label>
            <select [formControl]="customer.controls.id">
                @for(num of [1, 2, 3, 4 ,5]; track $index) {
                    <option [ngValue]="num">{{num}}</option>
                }
            </select>
        }
    </form>
    <!-- <pre>{{formStore.formEventData() | json}}</pre> -->
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactiveFormsArrayComponent {
    formStore = inject(ReactiveFormArrayStore)
}
