import { computed, Inject, inject, Injectable, linkedSignal } from '@angular/core';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
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
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { allEventsSignal } from '../form-events';

@Injectable({providedIn: 'root'}) export class CustomerService {
    vals = {
        firstName: 'Michael',
        lastName: 'Small',
        signedTOS: true
    }
}

export const ReactiveFormStore = signalStore(
  {providedIn: 'root'},
  withProps(() => ({
    customerService: inject(CustomerService)
  })),
  withProps((store, fb = inject(NonNullableFormBuilder)) => {
    const _signupForm = fb.group({
        firstName: fb.control('', [Validators.required]),
        lastName: fb.control(''),
        signedTOS: fb.control(false)
    })
    const _formEventData = allEventsSignal(_signupForm);
    return {
        form: _signupForm,
        formEventData: _formEventData
    }
  }),
  withHooks((store) => {
    return {
        onInit() {
            store.form.setValue(store.customerService.vals)
        },
        onDestroy() {
            console.log('onDestroy')
        }
    }
  })
);