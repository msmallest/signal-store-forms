import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signalStore, withComputed, withProps } from '@ngrx/signals';
import { withFormState } from './form-data.store.feature';
import { map } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';

type FormType = FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
}>;

export const ReactiveFormStore = signalStore(
    { providedIn: 'root' },
    withProps(() => {
        const fb = inject(NonNullableFormBuilder);
        return {
            fb: fb,
            form: fb.group({
                firstName: fb.control('', [Validators.required]),
                lastName: fb.control('')
            })
        }
    }),
    withFormState(),

)
@Component({
    selector: 'app-with-form-data-feature',
    imports: [ReactiveFormsModule, JsonPipe, AsyncPipe],
    template: `
        @let formGroup = formStore.form;
        <form [formGroup]="formGroup">
            <input formControlName="firstName" />
            <input formControlName="lastName" />
        </form>

        <pre>{{formStore.value() | json}}</pre>
        <pre>{{formStore.value$ | async | json}}</pre>
  `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithFormDataFeatureComponent {
    formStore = inject(ReactiveFormStore)
}
