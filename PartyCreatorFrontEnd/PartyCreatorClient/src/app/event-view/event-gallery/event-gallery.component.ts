import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from 'src/app/services/gallery.service';
import { CarouselModule } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { PhotoDto } from 'src/app/interfaces/photo-dto';

import { id } from 'date-fns/locale';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgToastService } from 'ng-angular-popup';
import { RoleDto } from 'src/app/interfaces/role-dto';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-gallery',
  templateUrl: './event-gallery.component.html',
  styleUrls: ['./event-gallery.component.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    CommonModule,
    CarouselModule,
    ImageModule,
    DialogModule,
    MatIconModule,
  ],
})
export class EventGalleryComponent implements OnInit {
  @Input() eventId = '';
  @Input() images: PhotoDto[] = [];
  @Input() numVisible: number = 0;
  @Input() imagesNum: number = 0;
  userRole: RoleDto = { id: 0, role: '' };

  imageUrls: string[] = [];
  responsiveOptions: any[] | undefined;
  display: boolean = false;
  selectedImage: string = '';
  autoplay: number = 3000;
  loaded: boolean = false;
  selectedImageUserId: number = 0;
  AutoPlay() {
    if (this.imagesNum < 4) {
      this.autoplay = 0;
    } else {
      this.autoplay = 3000;
    }
    this.loaded = false;
    setTimeout(() => {
      this.loaded = true;
    }, 0);
  }

  onDialogHide() {
    this.display = false;
  }

  showImage(event: MouseEvent, imageUrl: string, imageUserId: number) {
    event.stopPropagation();
    this.selectedImage = imageUrl;
    this.selectedImageUserId = imageUserId;
    this.display = true;
  }

  constructor(
    private galleryService: GalleryService,
    private toast: NgToastService,
    private eventService: EventService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imagesNum']) {
      this.AutoPlay();
    }
  }

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 3,
      },
      {
        breakpoint: '1220px',
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: '1100px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
    this.loadUserRole();
  }

  deleteImage() {
    if (this.selectedImage) {
      const selectedImage = this.images.find(
        (img) => img.image === this.selectedImage
      );

      if (selectedImage) {
        const imageId = selectedImage.id;
        const imageUserId = selectedImage.userId;

        if (
          this.userRole.role === 'Admin' ||
          this.userRole.id === imageUserId
        ) {
          this.galleryService.DeleteImage(imageId).subscribe(
            () => {
              console.log('Zdjęcie usunięte pomyślnie');
              this.display = false;
              this.toast.success({
                detail: 'SUCCESS',
                summary: 'Zdjęcie zostało usunięte!',
                duration: 3000,
              });

              this.images = this.images.filter((img) => img.id !== imageId);
              this.numVisible = this.images.length;
              this.imagesNum = this.images.length;
            },
            (error) => {
              console.error('Błąd podczas usuwania zdjęcia:', error);
              this.toast.error({
                detail: 'ERROR',
                summary:
                  'Zdjęcie nie zostało usunięte, nie jesteś organizatorem ani nie dodałeś tego zdjęcia!',
                duration: 3000,
              });
            }
          );
        } else {
          console.log('Brak uprawnień do usunięcia zdjęcia.');
        }
      }
    }
  }

  loadUserRole(): void {
    this.eventService.getAccess(this.eventId).subscribe(
      (data) => (this.userRole = data),
      (error) => console.error('Error loading user role', error)
    );
  }
}
