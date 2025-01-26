import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signalStore, withHooks, withProps } from '@ngrx/signals';
import { withFormState } from '../../form-data.store.feature';
import { tap } from 'rxjs';
import { JsonPipe } from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ChildComponent } from "./child.component";

export const ReactiveFormStore = signalStore(
    { providedIn: 'root' },
    withProps(() => {
        const initialState: {
            firstName: string;
            lastName: string;
            books: {
                title: string;
            }[];
        } = {
            firstName: 'Michael',
            lastName: 'Small',
            books: [
                {title: 'Book 1'}
            ],
        }
        const fb = inject(NonNullableFormBuilder);
        const c = fb.group({
            firstName: fb.control('', [Validators.required]),
            lastName: fb.control(''),
            books: fb.array<FormGroup<{title: FormControl<string>}>>([])
        }).getRawValue()

        return {
            initialState: initialState,
            fb: fb,
            form: fb.group({
                firstName: fb.control('', [Validators.required]),
                lastName: fb.control(''),
                books: fb.array<FormGroup<{title: FormControl<string>}>>([])
            })
        }
    }),
    withFormState(),
    withHooks({
        onInit(store) {
            store.initialState.books.forEach(book => store.form.controls.books.push(store.fb.group({title: book.title})))
            store.setDefaultValues()

            store.value$.pipe(
                tap((value) => {
                    const books = store.form.controls.books;
                    if (value.firstName === 'Nate') {
                        books.disable()
                    } else {
                        books.enable()
                    }

                    books.controls.forEach(book => {
                        if (book.getRawValue().title === 'bad') {
                            book.disable({emitEvent: false})
                        }
                    })
                })
            ).subscribe()
        }
    })

)
@Component({
  selector: 'app-parent',
  imports: [ReactiveFormsModule, JsonPipe, MatFormFieldModule, MatInputModule, ChildComponent, FormsModule],
  template: `
    <form [formGroup]="form">
        <mat-form-field>
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName"/>
        </mat-form-field>

        <mat-form-field>
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName"/>
        </mat-form-field>

        @for (book of form.controls.books.controls; track $index) {
            <app-child [index]="$index" />
        }
    </form>

    <mat-form-field>
        <mat-label>New Book Name</mat-label>
        <input matInput [(ngModel)]="newBook" />
    </mat-form-field>
    <button (click)="form.controls.books.push(fb.group({title: newBook()}))">Add Book</button>

    <pre>{{formStore.value() | json}}</pre>
  `,
  styles: `
    app-child {
        display: inline-block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParentComponent {
    formStore = inject(ReactiveFormStore);
    form = this.formStore.form;
    fb = this.formStore.fb;

    newBook = linkedSignal(() => 'new')
}
