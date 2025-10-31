import { Component, OnInit, inject, Injector, runInInjectionContext, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonToggle,
  AlertController,
  ToastController,
  ModalController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, create, funnel, settings, moon, sunny, refresh } from 'ionicons/icons';

import { Task } from '../models/task.interface';
import { Category } from '../models/category.interface';
import { TaskService } from '../services/task.service';
import { CategoryService } from '../services/category.service';
import { ThemeService } from '../services/theme.service';
import { FirebaseConfigService } from '../services/firebase-config.service';
import { FilterPipe } from '../pipes/filter.pipe';
import { CategoryManagerComponent } from '../components/category-manager/category-manager.component';
import { TaskFormModalComponent } from '../components/task-form-modal/task-form-modal.component';
import { LottieAnimationComponent } from '../components/lottie-animation/lottie-animation.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    FilterPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonButton,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonToggle,
    LottieAnimationComponent
  ],
})
export class HomePage implements OnInit {
  tasks: Task[] = [];
  categories: Category[] = [];
  filteredTasks: Task[] = [];
  selectedCategoryId: string = 'all';
  
  isDarkMode: boolean = false;
  isRemoteConfigInitialized: boolean = false;

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private themeService = inject(ThemeService);
  private firebaseConfigService = inject(FirebaseConfigService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private modalController = inject(ModalController);
  private actionSheetController = inject(ActionSheetController);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor() {
    addIcons({ add, trash, create, funnel, settings, moon, sunny, refresh });
  }

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      this.loadCategories();
      this.loadTasks();
      this.initializeTheme();
    });
  }

  private initializeTheme(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.ngZone.run(() => {
        this.isDarkMode = isDark;
        this.cdr.detectChanges();
      });
    });

    this.isRemoteConfigInitialized = this.firebaseConfigService.isConfigInitialized();
    
    this.logDebug(`Theme initialized - Dark mode: ${this.isDarkMode}, Remote Config: ${this.isRemoteConfigInitialized}`);
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.ngZone.run(() => {
          this.tasks = tasks;
          this.filterTasks();
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.showToast('Error al cargar las tareas', 'danger');
      }
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

  filterTasks() {
    if (this.selectedCategoryId === 'all') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(task => task.categoryId === this.selectedCategoryId);
    }
  }

  onCategoryChange(event: any) {
    this.selectedCategoryId = event.detail.value;
    this.filterTasks();
  }

  toggleTaskCompletion(task: Task) {
    if (task.id) {
      this.taskService.toggleTaskCompletion(task.id, !task.completed).subscribe({
        next: () => {
          this.ngZone.run(() => {
            task.completed = !task.completed;
            this.cdr.detectChanges();
          });
          
          const message = task.completed ? 'Tarea completada ✓' : 'Tarea marcada como pendiente';
          this.showToast(message, 'success');
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.showToast('Error al actualizar la tarea', 'danger');
        }
      });
    }
  }

  async deleteTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (task.id) {
              this.taskService.deleteTask(task.id).subscribe({
                next: () => {
                  runInInjectionContext(this.injector, () => {
                    this.loadTasks();
                  });
                  this.showToast('Tarea eliminada', 'success');
                },
                error: (error) => {
                  console.error('Error deleting task:', error);
                  this.showToast('Error al eliminar la tarea', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async addTask() {
    const modal = await this.modalController.create({
      component: TaskFormModalComponent,
      componentProps: {
        categories: this.categories
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'save' && result.data) {
        const taskData = result.data;
        
        this.taskService.createTask(taskData).subscribe({
          next: (taskId) => {
            this.loadTasks();
            this.showToast('Tarea creada exitosamente', 'success');
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.showToast('Error al crear la tarea', 'danger');
          }
        });
      }
    });

    await modal.present();
  }


  async openCategoryManager() {
    const modal = await this.modalController.create({
      component: CategoryManagerComponent
    });

    modal.onDidDismiss().then(() => {
      runInInjectionContext(this.injector, () => {
        this.loadCategories();
      });
    });

    await modal.present();
  }

  getCategoryName(categoryId?: string): string {
    if (!categoryId) return 'Sin categoría';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  }

  getCategoryColor(categoryId?: string): string {
    if (!categoryId) return '#666666';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.color || '#666666';
  }

  onThemeToggle(event: any): void {
    const isChecked = event.detail.checked;
    this.themeService.toggleDarkMode();
    this.showToast(
      `Tema ${isChecked ? 'oscuro' : 'claro'} activado (modo demostración)`,
      'success'
    );
  }

  async refreshRemoteConfig(): Promise<void> {
    try {
      const refreshed = await this.themeService.refreshThemeFromRemoteConfig().toPromise();
      
      if (refreshed) {
        this.isRemoteConfigInitialized = this.firebaseConfigService.isConfigInitialized();
        this.showToast('Configuración remota actualizada', 'success');
        this.logDebug('Remote Config refreshed successfully');
      } else {
        this.showToast('No se pudo actualizar la configuración', 'warning');
        this.logDebug('Remote Config refresh failed');
      }
    } catch (error) {
      this.logError('Error refreshing Remote Config', error);
      this.showToast('Error al actualizar configuración', 'danger');
    }
  }

  async showRemoteConfigInfo(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Firebase Remote Config',
      message: `
        <p><strong>Estado:</strong> ${this.isRemoteConfigInitialized ? 'Inicializado' : 'No inicializado'}</p>
        <p><strong>Tema oscuro:</strong> ${this.isDarkMode ? 'Activado' : 'Desactivado'}</p>
        <p><strong>Fuente:</strong> ${this.isRemoteConfigInitialized ? 'Firebase Remote Config' : 'Valores por defecto'}</p>
        <br>
        <small>Este feature flag demuestra cómo Firebase Remote Config puede controlar características de la aplicación en tiempo real.</small>
      `,
      buttons: [
        {
          text: 'Actualizar Config',
          handler: () => {
            this.refreshRemoteConfig();
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
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

  private logDebug(message: string): void {
    console.log(`[HomePage] ${message}`);
  }

  private logError(message: string, error: any): void {
    console.error(`[HomePage] ${message}:`, error);
  }
}
