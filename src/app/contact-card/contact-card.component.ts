import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../server.service';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrls: ['./contact-card.component.css']
})
export class ContactCardComponent implements OnInit {
  @Input() contactName: string;
  @Input() contactNumber: number;
  @Input() index: number;

  constructor(private serverService: ServerService) { }

  ngOnInit() {
  }

  onDelete(index: number) {
    this.serverService.contactToBeDeleted.next(index);
  }

  onEdit(index: number) {
    this.serverService.contactToBeEdited.next(index);
  }

}
