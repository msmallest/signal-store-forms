import { computed, inject, Injectable, linkedSignal } from '@angular/core';
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
import { FormGroup } from '@angular/forms';

@Injectable({providedIn: 'root'}) export class BooksService {}
type Book = {
    title: string,
    pages: number,
    author: string,
}

type BooksState = {
  books: Book[];
  isLoading: boolean;
};

const initialState: BooksState = {
  books: [],
  isLoading: false,
};

export const BooksStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withComputed(({ books }) => ({
    booksCount: computed(() => books().length),
  })),
  withMethods((store, booksService = inject(BooksService)) => ({})),
  withProps((store) => {
    const _firstName = linkedSignal(() => '');
    const _lastName = linkedSignal(() => '');
    const _signedTOS = linkedSignal({
        source: () => ({fn: _firstName(), ln: _lastName()}),
        computation: (src, prev) => {
            console.log(prev?.source.fn)
            if (prev && prev.source.fn !== src.fn && prev.source.ln !== src.ln) {
                return false
            } else {
                return false
            }
        }
    })

    const _form = {
        firstName: _firstName,
        lastName: _lastName,
        signedTOS: _signedTOS
    }
    return {
        form: _form
    }
  }),
  withState({valid: false}),
  withMethods((store) => ({
    setValidity(v: boolean): void {
        patchState(store, (state) => ({valid: v}))
    }
  })),
  withHooks((store) => {
    return {
        onInit() {
        },
        onDestroy() {
            console.log('onDestroy')
        }
    }
  })
);