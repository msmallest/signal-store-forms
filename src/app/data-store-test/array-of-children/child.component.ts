import { ChangeDetectionStrategy, Component, effect, EventEmitter, HostAttributeToken, inject, input, linkedSignal, Output, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormStore } from './parent.component';
import { JsonPipe } from '@angular/common';
import { rxEffect } from 'ngxtension/rx-effect';
import { outputFromObservable, outputToObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, concat, map, merge, tap } from 'rxjs';
import { concatLatestFrom } from '@ngrx/operators';

@Component({
  selector: 'app-child',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, JsonPipe],
  template: `
    <p>index(): {{index()}}</p>
    <p>{{loadedTime}}</p>
        <mat-form-field>
            <mat-label>Book Title</mat-label>
            <input matInput [formControl]="book.controls.title" />
        </mat-form-field>

    <button (click)="delete.emit(index() ?? -1)" type="button">Delete</button>

    <pre>{{form.getRawValue() | json}}</pre>

    <pre>{{myProps()}}</pre>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent {
    index = input<number>()

    loadedTime = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;;

    formService = inject(ReactiveFormStore)
    form = this.formService.form;
    fb = this.formService.fb;
    
    book = this.form.controls.books.at(this.index() ?? -1)

    delete = output<number>();

    // WIP - doesn't quite work
    // book = toSignal(concat(toObservable(this.index), outputToObservable(this.delete)).pipe(
    //     map((res) => {
    //         console.log(res);
    //         console.log(this.form.controls.books.at(res!))
    //         return this.form.controls.books.at(res!)
    //     })
    // )) 

    deletedIndex$ = outputToObservable(this.delete)
    index$ = toObservable(this.index)
    
    myProps = input<string>()
    ngOnInit() {
        this.delete.subscribe(() => {
            console.log(this.index())
            this.book = this.form.controls.books.at(this.index() ?? -1)
        })

        this.deletedIndex$.subscribe((res) => console.log('deletedIndex$', res))
        this.index$.subscribe(res => console.log('index$', res))
    }
}
