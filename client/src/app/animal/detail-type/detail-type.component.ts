import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimalService } from 'src/app/services/animal.service';
import { Subscription } from 'rxjs';
import { Animal } from 'src/app/models/animal';
import { ActivatedRoute } from '@angular/router';
import { Type } from 'src/app/models/type';
import { TypeService } from 'src/app/services/type.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-detail-type',
  templateUrl: './detail-type.component.html',
  styleUrls: ['./detail-type.component.css']
})
export class DetailTypeComponent implements OnInit, OnDestroy {
  idType: number;
  subscriptionAnimal: Subscription;
  subscriptionType: Subscription;
  subscriptionAnimalDelete: Subscription;
  type: Type;
  animals: Animal[];
  pagination = 1;

  constructor(
    private animalService: AnimalService,
    private typeService: TypeService,
    private route: ActivatedRoute,
    private flashMessagesService: FlashMessagesService
  ) {}

  ngOnInit() {
    this.idType = +this.route.snapshot.paramMap.get('type');

    this.subscriptionType = this.typeService.getTypeById(this.idType).subscribe(
      type => {
        this.type = type;
        this.getAllAnimalByType();
      },
      error => {
        console.log('Error getting type');
      }
    );
  }

  getAllAnimalByType() {
    this.subscriptionAnimal = this.animalService
    .getAllAnimalByType(this.idType)
    .subscribe(
      animals => {
        this.animals = animals;
        this.getAge();
        this.getLastWeight();
      },
      error => {
        console.log('Error getting animals by type');
      }
    );
  }

  deleteAnimal(id) {
    if (confirm('Are you sure to want to delete this animal permanently (this operation cannot be reversed)?')) {
      this.subscriptionAnimalDelete = this.animalService.removeAnimalById(id).subscribe(result => {
        this.flashMessagesService.show('Animal successfully deleted.',
           { cssClass: 'alert-success', timeout: 5000 });
        this.getAllAnimalByType();
      }, error => {
        console.log('Error deleting animal', error.error);
        this.flashMessagesService.show('Error deleting the animal.' + error.error,
           { cssClass: 'alert-error', timeout: 5000 });
      });
    }
  }

  getAge() {
    this.animals.forEach(animal => {
      if (animal.birth !== null) {
        animal.age =
          new Date().getFullYear() - new Date(animal.birth).getFullYear();
      }
    });
  }

  getLastWeight() {
    this.animals.forEach(animal => {
      if (animal.weights.length !== 0) {
        animal.lastDateWeight = animal.weights[animal.weights.length - 1].date;
        animal.lastWeight = animal.weights[animal.weights.length - 1].measure;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscriptionAnimal !== undefined) {
      this.subscriptionAnimal.unsubscribe();
    }
    if (this.subscriptionType !== undefined) {
      this.subscriptionType.unsubscribe();
    }
    if (this.subscriptionAnimalDelete !== undefined) {
      this.subscriptionAnimalDelete.unsubscribe();
    }
  }
}
