import {inject, Injectable} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

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
  value = toSignal(this.value$)

  disableAt(index: number) {
    console.log(index);
    console.log(this.form.controls.books)
    this.form.controls.books.at(index).disable();
  }
}
