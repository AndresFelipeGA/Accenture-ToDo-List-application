import { Injectable, inject, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseConfigService } from './firebase-config.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  
  public readonly isDarkMode$ = this.isDarkModeSubject.asObservable();
  
  private firebaseConfigService = inject(FirebaseConfigService);

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Subscribe to dark mode changes from Firebase Remote Config
    this.firebaseConfigService.getDarkModeEnabled().subscribe({
      next: (darkModeEnabled) => {
        this.logDebug(`Remote Config dark mode changed: ${darkModeEnabled}`);
        this.setDarkMode(darkModeEnabled);
      },
      error: (error) => {
        this.logError('Failed to subscribe to dark mode changes', error);
        this.setDarkMode(false); // Default to light theme on error
      }
    });

    // Set initial dark mode state
    const initialDarkMode = this.firebaseConfigService.isDarkModeEnabled();
    this.setDarkMode(initialDarkMode);
  }

  private setDarkMode(isDark: boolean): void {
    try {
      const body = document.body;
      
      if (isDark) {
        this.renderer.addClass(body, 'dark-theme');
        this.renderer.removeClass(body, 'light-theme');
      } else {
        this.renderer.addClass(body, 'light-theme');
        this.renderer.removeClass(body, 'dark-theme');
      }

      this.isDarkModeSubject.next(isDark);
      
      this.logDebug(`Theme applied: ${isDark ? 'dark' : 'light'} mode`);
      
    } catch (error) {
      this.logError('Failed to apply theme', error);
    }
  }

  public isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  public toggleDarkMode(): void {
    const currentMode = this.isDarkModeSubject.value;
    this.setDarkMode(!currentMode);
    this.logDebug(`Theme toggled manually to: ${!currentMode ? 'dark' : 'light'} mode`);
  }

  public refreshThemeFromRemoteConfig(): Observable<boolean> {
    this.logDebug('Refreshing theme from Remote Config');
    return this.firebaseConfigService.refreshConfig();
  }

  public getThemeStatus(): Observable<boolean> {
    return this.isDarkMode$;
  }

  public applyCustomColors(colors: { [key: string]: string }): void {
    try {
      const root = document.documentElement;
      
      Object.entries(colors).forEach(([property, value]) => {
        this.renderer.setStyle(root, `--${property}`, value);
      });
      
      this.logDebug('Custom colors applied');
      
    } catch (error) {
      this.logError('Failed to apply custom colors', error);
    }
  }

  public resetToSystemPreference(): void {
    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
      this.logDebug(`Theme reset to system preference: ${prefersDark ? 'dark' : 'light'}`);
      
    } catch (error) {
      this.logError('Failed to reset to system preference', error);
      this.setDarkMode(false);
    }
  }

  /**
   * Debug logging helper
   * Follows DRY principle
   */
  private logDebug(message: string): void {
    // Silent logging
  }

  /**
   * Error logging helper
   * Follows DRY principle and provides consistent error handling
   */
  private logError(message: string, error: any): void {
    // Silent error logging
  }
}