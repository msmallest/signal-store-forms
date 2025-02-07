import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParentComponent } from "./array-of-children/parent.component";
import {AltParentComponent} from './array-of-children/alt-parent.component';

@Component({
  selector: 'app-array-of-children',
  imports: [ParentComponent, AltParentComponent],
  template: `
<!--    <app-parent>-->
    <app-alt-parent />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrayOfChildrenComponent {

}
