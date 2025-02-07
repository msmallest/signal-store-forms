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
            const formEvents = form.events.pipe(
                shareReplay(1)
            );

            const _pristine$ = pristineValue$(form, formEvents).pipe(
              shareReplay(1)
            );
            const _touched$ = touchedValue$(form, formEvents).pipe(
              shareReplay(1)
            );
            const _value$ = valueValue$<ReturnType<typeof form.getRawValue>>(form).pipe(
              shareReplay(1)
            );;
            const _status$ = statusValue$(form, formEvents).pipe(
              shareReplay(1)
            );

            // derived

            const _valid$ = _status$.pipe(
              map((s) => s === 'VALID')
            )
            const _invalid$ = _status$.pipe(
              map((s) => s === 'INVALID')
            )
            const _pending$ = _status$.pipe(
              map((s) => s === 'PENDING')
            )
            const _disabled$ = _status$.pipe(
              map((s) => s === 'DISABLED')
            )

            const _dirty$ = _pristine$.pipe(
              map(d => !d)
            )
            const _untouched$ = _touched$.pipe(
              map(t => !t)
            )

            // Submitted/reset probably done on case by case basis but maybe do-able in here
            return {
                // Value needs to be handled special in the next `withProps`
                _value$: _value$,
                // Status and derived values
                status$: _status$,
                status: toSignal(_status$, {initialValue: form.status}),
                valid$: _valid$,
                valid: toSignal(_valid$, {initialValue: form.valid}),
                invalid$: _invalid$,
                invalid: toSignal(_invalid$, {initialValue: form.invalid}),
                pending$: _pending$,
                pending: toSignal(_pending$, {initialValue: form.pending}),
                disabled$: _disabled$,
                disabled: toSignal(_disabled$, {initialValue: form.disabled}),
                // Pristine and dirty
                pristine$: _pristine$,
                pristine: toSignal(_pristine$, {initialValue: form.pristine}),
                dirty$: _dirty$,
                dirty: toSignal(_dirty$, {initialValue: form.dirty}),
                // Touched/untouched
                touched$: _touched$,
                touched: toSignal(_touched$, {initialValue: form.touched}),
                untouched$: _untouched$,
                untouched: toSignal(_untouched$, {initialValue: form.untouched})
            }
        }),
        withProps((store) => {
            // Forms are near-impossible to type non nullably in an abstract with AbstractControl because typing came too late.
            // Our form builders will always be non-nullable, but the typing of that is not a public API.
            // These typings cheese the values to be typed as they should be
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
                    // TODO - dev check
                    console.log('must provide initialState')
                }
            },
            logValues() {
                // TODO - add all derived states
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
