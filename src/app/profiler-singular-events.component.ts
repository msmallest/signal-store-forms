import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ControlEvent, FormResetEvent, FormSubmittedEvent, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { pristineValue$, statusEvents$, statusValue$, touchedValue$, valueEvents$, valueValue$ } from '../form-events';
import { filter, tap } from 'rxjs';

@Component({
    selector: 'app-profiler-singular-events',
    imports: [ReactiveFormsModule, JsonPipe, AsyncPipe],
    template: `
     <form [formGroup]="personForm">
        <input formControlName="firstName" />
        <input formControlName="lastName" />

        <button (click)="personForm.controls.firstName.setValue('')" type="button">Reset first name</button>
        <button (click)="personForm.reset()" type="reset">Reset all</button>
        <button (click)="resetForm()" type="reset">Reset all, programatic</button>
        <button type="submit">Submit</button>

        <button (click)="personForm.controls.firstName.enable()" type="button">Enable</button>
    </form>

    <pre>firstName.disabled {{personForm.controls.firstName.disabled}}</pre>


    <pre>pristine$ {{pristine$ | async}}</pre>
    <pre>touched$ {{touched$ | async}}</pre>
    <!-- <pre>value$ {{value$ | async | json}}</pre> -->
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

    resetForm() {
        this.personForm.reset()
    }

    ngOnInit() {        
        this.value$.pipe(
            tap((v) => {
                console.log(v)
                if (v.firstName === 'test') {
                    console.log('disabling')
                    this.personForm.controls.firstName.disable({emitEvent: false})
                } else {
                    console.log('enabling')
                    this.personForm.controls.firstName.enable({emitEvent: false})
                }
            })
        ).subscribe()

        this.personForm.events.pipe(
            filter(
                (event: ControlEvent): event is FormResetEvent =>
                    event instanceof FormResetEvent
            ),
            tap(() => console.log('reset event'))
        ).subscribe()

        this.personForm.events.pipe(
            filter(
                (event: ControlEvent): event is FormSubmittedEvent =>
                    event instanceof FormSubmittedEvent
            ),
            tap(() => console.log('submit event'))
        ).subscribe()
    }
}
