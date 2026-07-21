import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<i
    class="ph{{ weight === 'regular' ? '' : '-' + weight }} ph-{{ name }}"
    [style.font-size.px]="size"
    style="display: inline-flex; line-height: 1; vertical-align: middle;"
    aria-hidden="true"
  ></i>`,
})
export class PhosphorIconComponent {
  @Input({ required: true }) name!: string;
  @Input() weight: 'regular' | 'bold' | 'fill' = 'regular';
  @Input() size = 20;
}
