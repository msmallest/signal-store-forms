import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormStore } from './parent.component';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-child',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, JsonPipe],
  template: `
    <mat-form-field>
        <mat-label>Book Title</mat-label>
        <input matInput [formControl]="book.controls.title" />
    </mat-form-field>

    <pre>{{form.getRawValue() | json}}</pre>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent {
    index = input<number>()

    formService = inject(ReactiveFormStore)
    form = this.formService.form;
    
    book = this.form.controls.books.at(this.index() ?? -1)

    logIndex = effect(() => console.log(this.index()))
}
