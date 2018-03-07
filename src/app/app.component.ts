import {Component, OnInit, ViewChild} from '@angular/core';
import {ContactsModel} from './contacts.model';
import {NgForm} from '@angular/forms';
import {ServerService} from './server.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Contact Card';
  @ViewChild('f') contactForm: NgForm;
  editMode = false;
  editedItemIndex: number;
  contacts: ContactsModel[] = [];
  contactsAddSubscription: Subscription;
  contactDeleteSubscription: Subscription;
  contactEditSubscription: Subscription;

  constructor(private serverService: ServerService) {
  }

  onSubmit(form: NgForm) {
    const contact = form.value;
    if (this.editMode) {
      this.editMode = false;
      this.contacts[this.editedItemIndex].name = contact.name;
      this.contacts[this.editedItemIndex].phonenumber = contact.phonenumber;
      this.serverService.setContacts(this.contacts);
      this.serverService.editContact(this.contacts[this.editedItemIndex])
        .subscribe(
          (res) => console.log('Contact edited successfully'),
          (error) => console.log(error)
        );
    } else {
      this.serverService.addContact(new ContactsModel(contact.name, contact.phonenumber))
        .subscribe((data) => {
          this.serverService.patchContact(data)
            .subscribe((res) => {
              console.log('Contact saved successfully');
            });
        }, (error) => console.log(error));
    }
    form.reset();
  }

  ngOnInit() {
    this.contactsAddSubscription = this.serverService.contactsChanged
      .subscribe(
        (contacts: ContactsModel[]) => {
          this.contacts = contacts;
        }
      );
    this.contactDeleteSubscription = this.serverService.contactToBeDeleted
      .subscribe((index: number) => {
        const uniqueId = this.contacts[index].uniqueid;
        this.contacts.splice(index, 1);
        this.serverService.deleteContact(uniqueId)
          .subscribe(
            (val) => console.log('Contact deleted successfully'),
            (error) => console.log(error)
          );
      });
    this.contactEditSubscription = this.serverService.contactToBeEdited
      .subscribe((index: number) => {
        this.editedItemIndex = index;
        this.editMode = true;
        this.contactForm.setValue({
          name: this.contacts[index].name,
          phonenumber: this.contacts[index].phonenumber
        });
      });
    this.serverService.loadContacts()
      .subscribe((data) => {
        this.contacts = data;
      });
  }

  onClear() {
    this.contactForm.reset();
  }

  onCancel() {
    this.editMode = false;
    this.onClear();
  }
}
