import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { pristineValue$, statusEvents$, statusValue$, touchedValue$, valueEvents$, valueValue$ } from '../form-events';
import { tap } from 'rxjs';

@Component({
  selector: 'app-profiler-singular-events',
  imports: [ReactiveFormsModule, JsonPipe, AsyncPipe],
  template: `
     <form [formGroup]="personForm">
        <input formControlName="firstName" />
        <input formControlName="lastName" />
    </form>
    <button (click)="personForm.controls.firstName.setValue('')">Reset first name</button>

    <pre>pristine$ {{pristine$ | async}}</pre>
    <pre>touched$ {{touched$ | async}}</pre>
    <pre>value$ {{value$ | async | json}}</pre>
    <pre>status$ {{status$ | async}}</pre>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilerSingularEventsComponent {
    fb = inject(NonNullableFormBuilder);
    personForm = this.fb.group({
        firstName: this.fb.control('', [Validators.required]),
        lastName: this.fb.control('')
    })

    pristine$ = pristineValue$(this.personForm);
    touched$ = touchedValue$(this.personForm);
    value$ = valueValue$(this.personForm);
    status$ = statusValue$(this.personForm);

    ngOnInit() {
        this.value$.pipe(
            tap((v) => {
                console.log(v);
                if (v.firstName === 'test') {
                    this.personForm.controls.firstName.disable()
                } else {
                    console.log('enabling')
                    this.personForm.controls.firstName.enable()
                }
            })
        ).subscribe()
    }
}
