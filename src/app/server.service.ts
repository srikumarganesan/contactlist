import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import {ContactsModel} from './contacts.model';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ServerService {
  contactsChanged = new Subject<ContactsModel[]>();
  contactToBeDeleted = new Subject<number>();
  contactToBeEdited = new Subject<number>();
  private contacts: ContactsModel[] = [];
  baseUrl = 'https://contact-card-4fe66.firebaseio.com/data';
  constructor(private httpClient: HttpClient) {}
  private headers = new HttpHeaders().set('content-type', 'application/json');

  addContact(contact: ContactsModel) {
    return this.httpClient.post(this.baseUrl + '.json', contact, {headers: this.headers, observe: 'body'})
      .map((data) => {
        contact.uniqueid = data['name'];
        this.updateContacts(contact);
        return data['name'];
      })
      .catch((error) => Observable.throw('Not able to store the contact'));
  }

  updateContacts(contact: ContactsModel) {
    this.contacts.push(contact);
    this.contactsChanged.next(this.contacts.slice());
  }

  getContacts() {
    this.contacts.slice();
  }

  editContact(contact: ContactsModel) {
    return this.httpClient.put(this.baseUrl + '/' + contact.uniqueid + '.json', contact, {headers: this.headers, observe: 'body'})
      .catch((error) => Observable.throw('Not able to edit the contact'));
  }

  loadContacts() {
    return this.httpClient.get(this.baseUrl + '.json', {headers: this.headers, observe: 'body'})
      .map((data) => {
        for (const contact in data) {
          if (data.hasOwnProperty(contact)) {
            this.contacts.push(data[contact]);
          }
        }
        return this.contacts;
      });
  }

  deleteContact(uniqueId: string) {
    return this.httpClient.delete(this.baseUrl + '/' + uniqueId + '.json')
      .catch((error) => Observable.throw('Not able to delete the contact'));
  }

  setContacts(contacts: ContactsModel[]) {
    this.contacts = contacts;
    this.contactsChanged.next(this.contacts.slice());
  }

  patchContact(uniqueId: string) {
    return this.httpClient.patch(this.baseUrl + '/' + uniqueId + '.json', {'uniqueid': uniqueId}, {headers: this.headers, observe: 'body'});
  }
}
