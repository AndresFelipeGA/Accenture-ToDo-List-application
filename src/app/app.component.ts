import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ThemeService } from './services/theme.service';
import { FirebaseConfigService } from './services/firebase-config.service';

/**
 * App Component
 *
 * Follows SOLID principles:
 * - Single Responsibility: Manages only app-level initialization
 * - Dependency Inversion: Depends on service abstractions
 *
 * Implements Clean Code practices:
 * - Clear initialization flow
 * - Proper service injection
 * - Error handling for service initialization
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private firebaseConfigService = inject(FirebaseConfigService);

  constructor() {
    this.logDebug('App component initialized');
  }

  ngOnInit() {
    this.initializeServices();
  }

  /**
   * Initialize core application services
   * Follows the initialization pattern with proper error handling
   */
  private initializeServices(): void {
    try {
      // Theme service is automatically initialized via injection
      // Firebase config service is automatically initialized via injection
      this.logDebug('Core services initialized successfully');
      
    } catch (error) {
      this.logError('Failed to initialize core services', error);
    }
  }

  /**
   * Debug logging helper
   * Follows DRY principle
   */
  private logDebug(message: string): void {
    console.log(`[AppComponent] ${message}`);
  }

  /**
   * Error logging helper
   * Follows DRY principle and provides consistent error handling
   */
  private logError(message: string, error: any): void {
    console.error(`[AppComponent] ${message}:`, error);
  }
}
