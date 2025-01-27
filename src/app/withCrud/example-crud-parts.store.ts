import { signalStore } from "@ngrx/signals";
import { withCreate, withSomeCrud } from "./withcrud.store.feature";

export const ReactiveFormStore = signalStore(
    { providedIn: 'root' },
    withSomeCrud(
        withCreate<string>(CrudService<string>)
    )
)