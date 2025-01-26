import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { allEventsObservable, allEventsSignal, touchedEvents$ } from '../form-events';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { distinctUntilChanged, map, shareReplay, tap } from 'rxjs';

@Component({
  selector: 'app-form-events-profiler-test',
  imports: [JsonPipe, ReactiveFormsModule, AsyncPipe],
  template: `
    <form [formGroup]="personForm">
        <input formControlName="firstName" />
        <input formControlName="lastName" />
    </form>
    <pre>{{formVals() | json}}</pre>
    <pre>{{formVals$ | async | json}}</pre>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormEventsProfilerTestComponent {
    fb = inject(NonNullableFormBuilder);
    personForm = this.fb.group({
        firstName: this.fb.control('', [Validators.required]),
        lastName: this.fb.control('')
    })

    formEvents = this.personForm.events.pipe(
        shareReplay(1)
    )

    formVals = allEventsSignal(this.personForm);
    formVals$ = allEventsObservable<ReturnType<typeof this.personForm.getRawValue>>(this.personForm);

    ngOnInit() {
        this.personForm.controls.firstName.valueChanges.pipe(
            tap((v) => {
                if (v === 'test') {
                    console.log('disabling')
                    this.personForm.controls.firstName.disable({emitEvent: false})
                } else {

                }
            })
        ).subscribe()
    }
}
