import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParentComponent } from "./array-of-children/parent.component";

@Component({
  selector: 'app-array-of-children',
  imports: [ParentComponent],
  template: `
    <app-parent>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrayOfChildrenComponent {

}
