import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-child',
  imports: [],
  template: `
    <p>
      child works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent {

}
