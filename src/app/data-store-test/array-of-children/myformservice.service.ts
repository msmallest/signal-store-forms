import {effect, inject, Injectable} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {deepComputed} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {rxEffect} from 'ngxtension/rx-effect';

@Injectable({providedIn: 'root'}) export class MyformserviceService {
  initialState: {
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
  fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    firstName: this.fb.control('', [Validators.required]),
    lastName: this.fb.control(''),
    books: this.fb.array<FormGroup<{ title: FormControl<string> }>>([])
  })

  value$ = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    map(() => this.form.getRawValue())
  )
  _value = toSignal(this.value$, {requireSync: true})
  value = deepComputed(() => this._value())

  disableAt(index: number) {
    console.log(index);
    console.log(this.form.controls.books)
    this.form.controls.books.at(index).disable();
  }

  constructor() {
    this.form.controls.books.push(this.fb.group({title: 'test'}))
    // Effect
    const disable = effect(() => {
      if (this.value.books().map(b => b.title.toLowerCase()).includes('nate')) {
        console.log('hit')
        this.form.controls.books.disable({emitEvent: false});
      }
    })
    // Subscribe
    const disable$ = rxEffect(
      this.form.controls.books.valueChanges,
      (res) => {
        if (res.map(b => b.title?.toLowerCase()).includes('nate')) {
          console.log('hit')
          this.form.controls.books.disable({emitEvent: false});
        }
      }
    )
  }
}
