import { computed, Inject, inject, Injectable, linkedSignal } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { allEventsObservable, allEventsSignal } from '../form-events';

@Injectable({providedIn: 'root'}) export class CustomerService {
    vals = {
        firstName: 'Michael',
        lastName: 'Small',
        id: 1
    }
}

export const ReactiveFormArrayStore = signalStore(
  {providedIn: 'root'},
  withProps(() => ({
    customerService: inject(CustomerService)
  })),
  withProps((store, fb = inject(NonNullableFormBuilder)) => {
    const _signupForm = fb.group({
        certifyValid: fb.control<boolean>(false),
        customers: fb.array<FormGroup<{
            firstName: FormControl<string>;
            lastName: FormControl<string>;
            id: FormControl<number | undefined>;
        }>>([])
    })
    const _formEventData = allEventsSignal<ReturnType<typeof _signupForm.getRawValue>>(_signupForm);
    const _formEventData$ = allEventsObservable<ReturnType<typeof _signupForm.getRawValue>>(_signupForm);
    return {
        form: _signupForm,
        formEventData: _formEventData,
        formEventData$: _formEventData$
    }
  }),
  withMethods((store, fb = inject(NonNullableFormBuilder)) => ({
    addCustomer(): void {
        const form = fb.group({
            firstName: fb.control(''),
            lastName: fb.control(''),
            id: fb.control<number | undefined>(undefined)
        })
        store.form.controls.customers.push(form)
    }
  })),
  withHooks((store) => {
    return {
        onInit() {
            store.form.valueChanges.pipe(
                map((data) => {
                    return data.customers
                }),
                    tap((customers) => {
                        if (customers?.map(customer => customer.id).includes(2)) {
                            store.form.controls.certifyValid.disable({emitEvent: false})
                            console.log('disabled')
                        } else {
                            store.form.controls.certifyValid.enable({emitEvent: false});
                            console.log('enabled')
                        }
                    })
                
            ).subscribe()
        },
        onDestroy() {
            console.log('onDestroy')
        }
    }
  })
);