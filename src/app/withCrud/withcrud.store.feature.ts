import { computed, inject, Type } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { patchState, SignalStoreFeature, signalStoreFeature, type, withComputed, withMethods } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Observable, pipe, switchMap } from "rxjs";


export type BaseEntity = { id: string };

export interface Todo extends BaseEntity {
    value: string;
    done: boolean;
}

export type BaseState<Entity> = {
    items: Entity[];
    loading: boolean;
};

export interface CrudService<T> {
    getItems(): Observable<T[]>;

    getItemsAsPromise(): Promise<T[]>; // Yes, we can also use promises instead of Observables

    getItem(id: string): Observable<T>;

    addItem(value: string): Observable<T>;

    updateItem(value: T): Observable<T>;

    deleteItem(value: T): Observable<any>;
}

export function withCrudOperations<Entity extends BaseEntity>(
    dataServiceType: Type<CrudService<Entity>> // pass the service here
) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
        },
        withMethods((store) => {
            const service = inject(dataServiceType);

            return {
                deleteItem: rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return service.deleteItem(item).pipe(
                                tapResponse({
                                    next: () => {
                                        patchState(store, {
                                            items: [...store.items().filter((x) => x.id !== item.id)],
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                ),

            };
        }),
    );
}

export function withCreate<Entity extends BaseEntity>(
) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
            props: type<{ dataServiceType: Type<CrudService<Entity>> }>()
        },
        withMethods((store) => {
            const service = inject(store.dataServiceType);

            return {
                addItem: rxMethod<string>(
                    pipe(
                        switchMap((value) => {
                            patchState(store, { loading: true });

                            return service.addItem(value).pipe(
                                tapResponse({
                                    next: (addedItem) => {
                                        patchState(store, {
                                            items: [...store.items(), addedItem],
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                ),
            }
        }),
    );
}

export function withReadAll<Entity extends BaseEntity>(
) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
            props: type<{ dataServiceType: Type<CrudService<Entity>> }>()
        },
        withMethods((store) => {
            const service = inject(store.dataServiceType);

            return {
                read: rxMethod<void>(
                    pipe(
                        switchMap(() => {
                            patchState(store, { loading: true });

                            return service.getItems().pipe(
                                tapResponse({
                                    next: (items) => {
                                        patchState(store, {
                                            items: items,
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            )
                        })
                    )
                )
            }
        }),
    );
}

export function withUpdate<Entity extends BaseEntity>(
) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
            props: type<{ dataServiceType: Type<CrudService<Entity>> }>()
        },
        withCreate(),
        withMethods((store) => {
            const service = inject(store.dataServiceType);

            return {
                update: rxMethod<Entity>(
                    pipe(
                        switchMap((item) => {
                            patchState(store, { loading: true });

                            return service.updateItem(item).pipe(
                                tapResponse({
                                    next: (updatedItem) => {
                                        const allItems = [...store.items()];
                                        const index = allItems.findIndex((x) => x.id === item.id);

                                        allItems[index] = updatedItem;

                                        patchState(store, {
                                            items: allItems,
                                        });
                                    },
                                    error: console.error,
                                    finalize: () => patchState(store, { loading: false }),
                                })
                            );
                        })
                    )
                ),
            }
        }),
    );
}

type SingleArgFunction<T> = (arg: T) => void;

// TODO: type
const invokeAllWithArgs = <T>(arg: T, ...functions: SingleArgFunction<T>[]): any => {
  functions.forEach(fn => fn(arg));
};

export function withSomeCrud<Entity extends BaseEntity>(
    ...features: any
) {
    return signalStoreFeature(
        {
            state: type<BaseState<Entity>>(),
            props: type<{ dataServiceType: Type<CrudService<Entity>> }>()
        },
        invokeAllWithArgs(features),
    );
}