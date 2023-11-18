import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { EventDto } from '../interfaces/event-dto';
import {
  faLocationDot,
  faCheck,
  faCalendar,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpErrorResponse } from '@angular/common/http';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import * as leafletGeosearch from 'leaflet-geosearch';
import { RoleDto } from '../interfaces/role-dto';
import { MatDialog } from '@angular/material/dialog';
import { InviteModalComponent } from '../invite-modal/invite-modal.component';
import { AllGuestsListDto } from '../interfaces/all-guests-list-dto';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css'],
  animations: [
    trigger('slideDown', [
      state('void', style({ height: '0', opacity: '0' })),
      state('*', style({ height: '*', opacity: '1' })),
      transition('void <=> *', animate('500ms ease-in-out')),
    ]),
    trigger('pulse', [
      state('rest', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.2)' })),
      transition('rest <=> pulse', animate('500ms ease-in-out')),
    ]),
  ],
})
export class EventViewComponent implements OnInit {
  faArrowRight: any;
  selected: Date | null;
  eventDetails: EventDto | null;

  faClock = faClock;
  faCalendar = faCalendar;
  faLocationDot = faLocationDot;
  faCheck = faCheck;
  isThingsToBringVisible: boolean = false;
  isMapVisible: boolean = false;

  arrowAnimationState: string = 'rest';

  guestsUsers: AllGuestsListDto[] = [];
  invitesUsers: AllGuestsListDto[] = [];
  creatorFirstName: string = '';
  creatorLastName: string = '';
  userRole: RoleDto = {id: 0, role: ""};

  constructor(private route: ActivatedRoute, private eventService: EventService, private toast: NgToastService, private router: Router, private userService: UserService, public dialog: MatDialog) {
    this.selected = null;
    this.eventDetails = null;
  }

  ngOnInit(): void {
    this.authorization();
  }

  loadEventDetails(): void {
    const eventId: string | null = this.route.snapshot.paramMap.get('id');
    if (eventId !== null) {
      this.eventService.getEventDetails(eventId).subscribe(
        (data: EventDto | null) => {
          if (data !== null) {
            this.eventDetails = data;
            console.log(this.eventDetails);
            console.log(this.eventDetails.creatorId);
            this.userService
              .getUserData(this.eventDetails.creatorId.toString())
              .subscribe((user) => (this.creatorFirstName = user.firstName, this.creatorLastName = user.lastName));
            this.eventService
              .getGuestsUsers(data.id.toString())
              .subscribe((users) => (this.guestsUsers = users));
            this.eventService
              .getInvitesUsers(data.id.toString())
              .subscribe((users) => (this.invitesUsers = users));
          } else {
            console.error('Otrzymano nullowe dane z serwera');
          }
        },
        (error: any) => {
          console.error(
            'Wystąpił błąd podczas pobierania szczegółów wydarzenia',
            error
          );
        }
      );
    } else {
      console.error('ID wydarzenia jest nullem lub niezdefiniowane');
    }
  }

  // Added function to toggle visibility
  toggleThingsToBringVisibility(): void {
    this.isThingsToBringVisible = !this.isThingsToBringVisible;
    this.arrowAnimationState = this.isThingsToBringVisible ? 'pulse' : 'rest';
  }

  authorization() {
    const eventId: string | null = this.route.snapshot.paramMap.get('id');
    this.eventService.getAccess(eventId!).subscribe({
      next: (res) => {
        this.loadEventDetails();
        this.userRole=res;
        console.log(this.userRole);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error({
          detail: 'ERROR',
          summary: err.error,
          duration: 3000,
        });
        this.router.navigate(['main']);
      }
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(InviteModalComponent, {
      data: this.guestsUsers,
      panelClass: 'testDialog2',
    });

    dialogRef.afterClosed().subscribe((res) => {
      
    });
  }

  toggleMapVisibility(): void {
    if (this.isMapVisible) {
      this.isMapVisible = false;
    } else {
      // Wyszukiwanie koordynatów tylko, gdy mapa jest ustawiona na widoczność
      this.findMapCoordinates();
    }
  }
  
  private findMapCoordinates(): void {
    const addressToGeocode = this.eventDetails?.address + ', ' + this.eventDetails?.city;
  
    if (addressToGeocode) {
      const provider = new leafletGeosearch.OpenStreetMapProvider();
      
      provider.search({ query: addressToGeocode })
        .then((result: any) => {
          if (result.length > 0) {
            this.isMapVisible = true;
          } else {
            this.toast.error({
              detail: 'Mapa nie potrafiła znaleźć tego adresu.',
              duration: 3000,
            });
            // Dodaj odpowiedni kod, aby wyświetlić komunikat o błędzie (np. Angular Material Snackbar)
            console.error('Mapa nie potrafiła znaleźć tego adresu.');
          }
        })
        .catch((error: any) => {
          // Dodaj odpowiedni kod, aby wyświetlić komunikat o błędzie (np. Angular Material Snackbar)
          console.error('Błąd podczas geokodowania:', error);
          console.error('Mapa nie potrafiła znaleźć tego adresu.');
          this.toast.error({
            detail: 'Mapa nie potrafiła znaleźć tego adresu.',
            duration: 3000,
          });
        });
    }
  }
}  
