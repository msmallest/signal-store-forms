import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, EventEmitter, HostAttributeToken, inject, Input, input, linkedSignal, Output, output, OutputEmitterRef, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormStore } from './parent.component';
import { JsonPipe } from '@angular/common';
import { rxEffect } from 'ngxtension/rx-effect';
import { Subscription, tap } from 'rxjs';
import {MyformserviceService} from './myformservice.service';

// NOTES TO SELF
// The form signal store worked so, so well... until I needed to disable a form at a given index
// I could not do it directly in the component, nor with a function in the store
// My theory? Perhaps some context on the form is lost after the `withProps` akin to lost
//     context in form children normally? Idk
// Patching value was fine in the service at an index too, but subtle things like disabling did not work even
//     with some CDR stuff and removing change detection `OnPush`
@Component({
  selector: 'app-alt-child',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, JsonPipe],
  template: `
    <mat-form-field>
        <mat-label>Book Title</mat-label>
        <input matInput [formControl]="form.controls.title" />
    </mat-form-field>

    <button (click)="delete.emit(index())" type="button">Delete</button>

    <pre>form.value: {{form.value | json}}</pre>
    <pre>value(): {{value() | json}}</pre>

    <pre>disabled: {{form.disabled}}</pre>

    <button (click)="disableIt()">disable it {{index()}}</button>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AltChildComponent{
  readonly formService = inject(MyformserviceService);
  readonly cdr = inject(ChangeDetectorRef);

  @Input()
  form = new FormGroup({
    title: new FormControl('', {nonNullable: true}),
  })
  index = input.required<number>()
  delete = output<number>()

  disableIt() {
    console.log(this.index())
    this.formService.disableAt(this.index())
  }

  // value = computed(() => this.formService.value().books.at(this.index()));
  value = computed(() => this.formService.value.books().at(this.index()));
}
