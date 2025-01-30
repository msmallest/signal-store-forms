import { Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { AbstractControl, ControlEvent, FormControlStatus, PristineChangeEvent, StatusChangeEvent, TouchedChangeEvent, ValueChangeEvent } from "@angular/forms";
import { deepComputed, patchState, SignalStoreFeature, signalStoreFeature, type, withComputed, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { rxEffect } from "ngxtension/rx-effect";
import { distinctUntilChanged, filter, map, Observable, of, pairwise, shareReplay, startWith, Subject, tap } from "rxjs";

function isValueEvent<T>(
    event: ControlEvent | T
  ): event is ValueChangeEvent<T> {
    return event instanceof ValueChangeEvent;
  }

export function valueEvents$<T>(form: AbstractControl<T>, events: Observable<ControlEvent<T>>) {
  return events.pipe(
    filter(
      (event: ControlEvent): event is ValueChangeEvent<typeof form.value> =>
        event instanceof ValueChangeEvent
    ),
  );
}

export function valueValue$<T>(form: AbstractControl<T>): Observable<T>;
export function valueValue$<T>(form: AbstractControl): Observable<T>;
export function valueValue$<T>(form: AbstractControl<T>): Observable<T> {
    return valueEvents$(form, form.events).pipe(
        startWith(form.getRawValue()),
        map((value) => (isValueEvent(value) ? value.value : value)),
        distinctUntilChanged(
            (previous, current) =>
                JSON.stringify(previous) === JSON.stringify(current),
        ),
        map(() => form.getRawValue()),
        // tap(() => console.log('value hit'))
    )
}

export function statusEvents$<T>(events: Observable<ControlEvent<T>>) {
  return events.pipe(
    filter(
      (event: ControlEvent): event is StatusChangeEvent =>
        event instanceof StatusChangeEvent
    )
  );
}
export function statusValue$<T>(form: AbstractControl<T>, events: Observable<ControlEvent<T>>) {
    return statusEvents$(events).pipe(startWith(form.status)).pipe(
        map(() => form.status),
        // tap(() => console.log('status hit'))
    )
}

export function touchedEvents$<T>(events: Observable<ControlEvent<T>>) {
    return events.pipe(
    filter(
      (event: ControlEvent): event is TouchedChangeEvent =>
        event instanceof TouchedChangeEvent
    )
  );
}
export function touchedValue$<T>(form: AbstractControl<T>, events: Observable<ControlEvent<T>>) {
    return touchedEvents$(events).pipe(startWith(form.touched)).pipe(
        map(() => form.touched),
        // tap(() => console.log('touched hit'))
    )
}

export function pristineEvents$<T>(events: Observable<ControlEvent<T>>) {
    return events.pipe(
    filter(
        (event: ControlEvent): event is PristineChangeEvent =>
          event instanceof PristineChangeEvent
    )
  );
}
export function pristineValue$<T>(form: AbstractControl<T>, events: Observable<ControlEvent<T>>) {
    return pristineEvents$(events).pipe(startWith(form.pristine)).pipe(
        map(() => form.pristine),
        // tap(() => console.log('pristine hit'))
    )
}

type FormValues<TValue = any> = {
    pristine$: Observable<boolean>, 
    touched$: Observable<boolean>, 
    value$: Observable<TValue>, 
    status$: Observable<FormControlStatus>
}

export function withFormState<T, U extends T>() {
    return signalStoreFeature(
        {
          props: type<{ form: AbstractControl<T>, initialState: U }>(),
        },
        withProps(({form, initialState}) => {
            console.log(initialState)
            const formEvents = form.events.pipe(
                shareReplay(1)
            );

            const _pristine$ = pristineValue$(form, formEvents);
            const _touched$ = touchedValue$(form, formEvents);
            const _value$ = valueValue$<ReturnType<typeof form.getRawValue>>(form);
            const _status$ = statusValue$(form, formEvents);

            return {
                pristine$: _pristine$,
                touched$: _touched$,
                _value$: _value$,
                status$: _status$,
                pristine: toSignal(_pristine$, {initialValue: form.pristine}),
                touched: toSignal(_touched$, {initialValue: form.touched}),
                status: toSignal(_status$, {initialValue: form.status})
            }
        }),
        withProps((store) => {
            const _temp$ = store._value$ as Observable<Required<U>>;
            const _temp = toSignal(store._value$, {initialValue: store.form.getRawValue()}) as Signal<Required<U>>;
            const _tempDeep = deepComputed(() => _temp())
            return {
                value$: store._value$ as unknown as typeof _temp$,
                value: _tempDeep,
                formChangeForceCDR$: new Subject<void>()
            }
        }),
        withMethods((store) => ({
            setDefaultValues() {
                if (store.initialState) {
                    store.form.setValue(store.initialState)
                } else {
                    console.log('must provide initialState')
                }
            },
            logValues() {
                console.log({
                    value: store.form.value,
                    status: store.form.status,
                    touched: store.form.touched,
                    dirty: store.form.dirty,
                })
            }
        })),
        withHooks((store) => ({
            onInit() {
                const change = rxEffect(
                    store.value$.pipe(
                        tap(() => {
                            store.formChangeForceCDR$.next()
                        })
                    )
                )
            }
        }))
    )
}