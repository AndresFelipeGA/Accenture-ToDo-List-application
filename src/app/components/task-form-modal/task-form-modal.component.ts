import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-task-form-modal',
  templateUrl: './task-form-modal.component.html',
  styleUrls: ['./task-form-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonIcon
  ]
})
export class TaskFormModalComponent implements OnInit {
  title: string = '';
  description: string = '';
  selectedCategoryId: string = '';
  categories: Category[] = [];

  private modalController = inject(ModalController);

  constructor() {
    addIcons({ close });
  }

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    if (this.title.trim()) {
      const taskData = {
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        categoryId: this.selectedCategoryId || undefined
      };
      this.modalController.dismiss(taskData, 'save');
    }
  }
}