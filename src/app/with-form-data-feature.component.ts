import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signalStore, withComputed, withHooks, withProps } from '@ngrx/signals';
import { withFormState } from './form-data.store.feature';
import { map, tap } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';

type FormType = FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
}>;

export const ReactiveFormStore = signalStore(
    { providedIn: 'root' },
    withProps(() => {
        const initialState = {
            firstName: 'a',
            lastName: 'b'
        }
        const fb = inject(NonNullableFormBuilder);
        return {
            initialState: initialState,
            fb: fb,
            form: fb.group({
                firstName: fb.control('', [Validators.required]),
                lastName: fb.control('')
            })
        }
    }),
    withFormState(),
    withHooks({
        onInit(store) {
            store.value$.pipe(
                tap((v) => {
                    if (v.firstName === 'test') {
                        store.form.disable();
                        console.log('disabling')
                    } else {
                        store.form.enable();
                        console.log('enabling')
                    }
                })
            ).subscribe()
        }
    })

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
        <button (click)="formStore.setDefaultValues()">set default</button>
        <button (click)="formStore.logValues()">log vals</button>
  `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithFormDataFeatureComponent {
    formStore = inject(ReactiveFormStore);
}
