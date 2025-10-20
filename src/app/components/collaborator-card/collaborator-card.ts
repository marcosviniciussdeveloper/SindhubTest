import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-collaborator-card',
  standalone: true,
  templateUrl: './collaborator-card.component.html',
  styleUrls: ['./collaborator-card.component.scss']
})
export class CollaboratorCardComponent {
  @Input() name!: string;
  @Input() role!: string;
  @Input() photoUrl?: string;
}
