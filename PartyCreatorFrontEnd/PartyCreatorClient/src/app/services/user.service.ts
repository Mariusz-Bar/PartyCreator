import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { UserDto } from '../interfaces/user-dto';
import { ContactDto } from '../interfaces/contact-dto';
import { UserContactDto } from '../interfaces/user-contact-dto';
import { SearchEmailDto } from '../interfaces/search-email-dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  profileUpdated = new Subject<void>();
  constructor(private http: HttpClient) {}

  getUserData(userId: string): Observable<any> {
    return this.http.get<UserDto>(
      `https://localhost:7241/api/User/GetUserById/${userId}`
    );
  }

  getMyProfileData(): Observable<any> {
    return this.http.get<UserDto>(
      'https://localhost:7241/api/User/GetMyProfile'
    );
  }

  editMyProfileData(userData: UserDto): Observable<any> {
    return this.http.post<UserDto>(
      'https://localhost:7241/api/User/EditMyProfile',
      userData
    );
  }

  getMyContacts(): Observable<ContactDto[]> {
    return this.http.get<ContactDto[]>(
      'https://localhost:7241/api/User/GetMyContacts'
    );
  }

  addContact(contactData: ContactDto): Observable<ContactDto[]> {
    return this.http.post<ContactDto[]>(
      'https://localhost:7241/api/User/AddContact',
      contactData
    );
  }

  editContact(contactData: ContactDto): Observable<any> {
    return this.http.put<ContactDto>(
      `https://localhost:7241/api/User/EditContact/`,
      contactData
    );
  }

  deleteContact(contactId: string): Observable<any> {
    return this.http.delete<ContactDto>(
      `https://localhost:7241/api/User/DeleteContact/${contactId}`
    );
  }

  getUsersEmailContains(request: SearchEmailDto) {
    return this.http.post<UserContactDto[]>(
      'https://localhost:7241/api/User/GetUsersEmailContains',
      request
    );
  }
}
