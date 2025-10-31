import { Component, OnInit, inject, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonFab,
  IonFabButton,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash, close, checkmark } from 'ionicons/icons';

import { Category } from '../../models/category.interface';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-manager',
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonFab,
    IonFabButton
  ]
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  
  predefinedColors = [
    { name: 'Azul', value: '#3880ff' },
    { name: 'Verde', value: '#2dd36f' },
    { name: 'Rojo', value: '#eb445a' },
    { name: 'Naranja', value: '#ffc409' },
    { name: 'Púrpura', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Turquesa', value: '#06b6d4' },
    { name: 'Gris', value: '#6b7280' }
  ];

  private categoryService = inject(CategoryService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private injector = inject(Injector);

  constructor() {
    addIcons({ add, create, trash, close, checkmark });
  }

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      this.loadCategories();
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showToast('Error al cargar las categorías', 'danger');
      }
    });
  }

  async addCategory() {
    const alert = await this.alertController.create({
      header: 'Nueva Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Siguiente',
          handler: async (data) => {
            if (data.name.trim()) {
              await this.selectColorForCategory(data.name.trim());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async selectColorForCategory(name: string) {
    const alert = await this.alertController.create({
      header: 'Seleccionar Color',
      message: `Elige un color para "${name}"`,
      inputs: this.predefinedColors.map(color => ({
        name: 'color',
        type: 'radio',
        label: color.name,
        value: color.value,
        checked: color.value === '#3880ff'
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (selectedColor) => {
            if (selectedColor) {
              this.createCategory(name, selectedColor);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private createCategory(name: string, color: string) {
    this.categoryService.createCategory({ name, color }).subscribe({
      next: () => {
        this.loadCategories();
        this.showToast('Categoría creada exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.showToast('Error al crear la categoría', 'danger');
      }
    });
  }

  async editCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Editar Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría',
          value: category.name
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Siguiente',
          handler: async (data) => {
            if (data.name.trim()) {
              await this.selectColorForEditCategory(category, data.name.trim());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async selectColorForEditCategory(category: Category, name: string) {
    const alert = await this.alertController.create({
      header: 'Seleccionar Color',
      message: `Elige un color para "${name}"`,
      inputs: this.predefinedColors.map(color => ({
        name: 'color',
        type: 'radio',
        label: color.name,
        value: color.value,
        checked: color.value === category.color
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: (selectedColor) => {
            if (selectedColor && category.id) {
              this.updateCategory(category.id, name, selectedColor);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private updateCategory(categoryId: string, name: string, color: string) {
    this.categoryService.updateCategory(categoryId, { name, color }).subscribe({
      next: () => {
        this.loadCategories();
        this.showToast('Categoría actualizada exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.showToast('Error al actualizar la categoría', 'danger');
      }
    });
  }

  async deleteCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Las tareas asociadas quedarán sin categoría.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (category.id) {
              this.categoryService.deleteCategory(category.id).subscribe({
                next: () => {
                  this.loadCategories();
                  this.showToast('Categoría eliminada exitosamente', 'success');
                },
                error: (error) => {
                  console.error('Error deleting category:', error);
                  this.showToast('Error al eliminar la categoría', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}