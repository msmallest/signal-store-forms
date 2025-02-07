import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, EventEmitter, HostAttributeToken, inject, Input, input, linkedSignal, Output, output, OutputEmitterRef, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormStore } from './parent.component';
import { JsonPipe } from '@angular/common';
import { rxEffect } from 'ngxtension/rx-effect';
import { Subscription, tap } from 'rxjs';

// End of day notes
// - Haven't verified it but previous tests over the years tell me this is not needed for gauranteed, non indexed children
//       which can be injected directly and are not dependent on some index stuff.
//       Aka this whole hulabaloo is only needed for children of form arrays
//
// - This interface + form service in signal store approach needs real application to put this to the test but I think it works???
//
// - The idea: Basically, never directly instantiate the form in the class. Template with an `@let` alias is fine.
//
// - The CDR feature is not needed I think if no OnPush, or even if just the child opts out, but with this it is doable,
//       and allows easier other non-form places to benefit. The pain of this OnPush learning curve against my 
//       normal assumptions aside, I feel like I have a better understanding and better grip on the problem + solution.
//
// - Something could blindside this whole thing but for the moment it seems to work nice. I haven't tried the implications
//       of not being able to refer to a var for the form in the class, but I think if needed in a function instance I guess
//       it aught to be valid, and even if not I feel like the potential restriction may make for more independent child component logic.
//
// - The telling thing with CDR and if the forms are in the right place is to pull out any signal/rxjs stuff from the template and then
//       add an item and rename the title, then add another but don't touch it, then delete one of the first two items and seeing if
//       the new untouched form stays as is in value and `book.touched: false`. Again, for the sake of CDR, it is important this is
//       off of the form class's value and not the service's reactive values.
interface ChildOfFormArray {
    index: Signal<number>;
    formChangeForceCDR$: Subscription; // I like rxEffect to be able to give a name to what is needed, but perhaps this can be abstracted out
    cdr: ChangeDetectorRef; // In a perfect world, this would be private/#, but interfaces and OO blah blah blah
    delete: OutputEmitterRef<number>; // strictly speaking not needed
}

@Component({
  selector: 'app-child',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, JsonPipe],
  template: `
    <p>index(): {{index()}}</p>
    @let book = formService.form.controls.books.at(this.index());
    <mat-form-field>
        <mat-label>Book Title</mat-label>
        <input matInput [formControl]="book.controls.title" />
    </mat-form-field>

    <button (click)="delete.emit(index())" type="button">Delete</button>

    <pre>{{book.value | json}}</pre>
    <pre>{{book.touched}}</pre>
    <pre>val: {{val() | json}}</pre>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent implements ChildOfFormArray {
    readonly formService = inject(ReactiveFormStore);
    readonly cdr = inject(ChangeDetectorRef);

    index = input.required<number>()

    delete = output<number>();

    formChangeForceCDR$ = rxEffect(
        this.formService.formChangeForceCDR$.pipe(
            tap(() => {
                console.log('hit')
                this.cdr.markForCheck()
            })
        )
    )

    val = computed(() => this.formService.value.books().at(this.index()))
}
