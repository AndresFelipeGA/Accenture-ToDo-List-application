import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { 
  getRemoteConfig, 
  fetchAndActivate, 
  getValue, 
  RemoteConfig,
  isSupported
} from 'firebase/remote-config';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Configuration interface for Remote Config default values
 */
interface RemoteConfigDefaults {
  [key: string]: string | number | boolean;
  dark_mode_enabled: boolean;
  app_version_required: string;
  maintenance_mode: boolean;
}

/**
 * Firebase Remote Config Service
 * Manages feature flags and remote configuration
 * 
 * @follows SOLID principles:
 * - Single Responsibility: Only handles Remote Config
 * - Open/Closed: Extensible through configuration interface
 * - Dependency Inversion: Depends on Firebase abstractions
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {
  // Dependencies
  private readonly firebaseApp = inject(FirebaseApp);
  
  // Remote Config instance
  private remoteConfig: RemoteConfig | null = null;
  
  // State management
  private readonly darkModeEnabled$ = new BehaviorSubject<boolean>(false);
  private isInitialized = false;
  
  // Configuration
  private readonly CONFIG_SETTINGS = {
    production: {
      minimumFetchIntervalMillis: 3600000, // 1 hour
      fetchTimeoutMillis: 60000 // 60 seconds
    },
    development: {
      minimumFetchIntervalMillis: 60000, // 1 minute
      fetchTimeoutMillis: 60000 // 60 seconds
    }
  };

  private readonly DEFAULT_VALUES: RemoteConfigDefaults = {
    dark_mode_enabled: true,
    app_version_required: '1.0.0',
    maintenance_mode: false
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Remote Config with proper error handling
   */
  private async initialize(): Promise<void> {
    try {
      // Check if Remote Config is supported in this environment
      const supported = await isSupported();
      
      if (!supported) {
        this.log('Remote Config is not supported in this environment');
        this.applyDefaultValues();
        this.isInitialized = true;
        return;
      }

      await this.setupRemoteConfig();
      await this.fetchConfig();
      this.isInitialized = true;
      this.log('Remote Config initialized successfully');
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  /**
   * Setup Remote Config instance and settings
   */
  private async setupRemoteConfig(): Promise<void> {
    try {
      this.remoteConfig = getRemoteConfig(this.firebaseApp);
      
      const settings = environment.production 
        ? this.CONFIG_SETTINGS.production 
        : this.CONFIG_SETTINGS.development;
      
      this.remoteConfig.settings = settings;
      this.remoteConfig.defaultConfig = this.DEFAULT_VALUES;
      
      this.log('Remote Config setup completed');
    } catch (error) {
      throw new Error(`Failed to setup Remote Config: ${error}`);
    }
  }

  /**
   * Fetch and activate remote configuration
   */
  private async fetchConfig(): Promise<void> {
    if (!this.remoteConfig) {
      throw new Error('Remote Config not initialized');
    }

    try {
      const activated = await fetchAndActivate(this.remoteConfig);
      this.log(`Config ${activated ? 'activated with new values' : 'using cached values'}`);
      this.updateFeatureFlags();
    } catch (error: any) {
      // Handle specific error codes
      if (error?.code === 'fetch-throttle') {
        this.log('Fetch throttled, using cached values');
        this.updateFeatureFlags(); // Use cached values
      } else if (error?.code === 'fetch-timeout') {
        this.log('Fetch timeout, using default values');
        this.applyDefaultValues();
      } else if (error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
        this.logError('Firebase permissions error - check API key configuration', error);
        this.applyDefaultValues();
      } else {
        throw error;
      }
    }
  }

  /**
   * Update feature flags from Remote Config values
   */
  private updateFeatureFlags(): void {
    try {
      const darkMode = this.getConfigValue('dark_mode_enabled', 'boolean') as boolean;
      this.darkModeEnabled$.next(darkMode);
      this.log(`Feature flags updated - Dark Mode: ${darkMode}`);
    } catch (error) {
      this.logError('Failed to update feature flags', error);
      this.applyDefaultValues();
    }
  }

  /**
   * Get configuration value with type safety
   */
  private getConfigValue(
    key: keyof RemoteConfigDefaults, 
    type: 'boolean' | 'string' | 'number'
  ): boolean | string | number {
    if (!this.remoteConfig) {
      return this.DEFAULT_VALUES[key];
    }

    try {
      const value = getValue(this.remoteConfig, String(key));
      
      switch (type) {
        case 'boolean':
          return value.asBoolean();
        case 'string':
          return value.asString();
        case 'number':
          return value.asNumber();
        default:
          return this.DEFAULT_VALUES[key];
      }
    } catch (error) {
      this.logError(`Failed to get ${type} value for key: ${key}`, error);
      return this.DEFAULT_VALUES[key];
    }
  }

  /**
   * Handle initialization errors gracefully
   */
  private handleInitializationError(error: any): void {
    this.logError('Failed to initialize Remote Config', error);
    this.applyDefaultValues();
    this.isInitialized = true; // Mark as initialized with defaults
  }

  /**
   * Apply default values when Remote Config fails
   */
  private applyDefaultValues(): void {
    this.darkModeEnabled$.next(this.DEFAULT_VALUES.dark_mode_enabled);
    this.log('Using default values for feature flags');
  }

  /**
   * Public API: Get dark mode observable
   */
  public getDarkModeEnabled(): Observable<boolean> {
    return this.darkModeEnabled$.asObservable();
  }

  /**
   * Public API: Get current dark mode value
   */
  public isDarkModeEnabled(): boolean {
    return this.darkModeEnabled$.value;
  }

  /**
   * Public API: Refresh configuration from server
   */
  public refreshConfig(): Observable<boolean> {
    if (!this.isInitialized || !this.remoteConfig) {
      this.log('Cannot refresh - not initialized');
      return of(false);
    }

    return from(this.fetchConfig()).pipe(
      map(() => true),
      tap(() => this.log('Config refreshed successfully')),
      catchError(error => {
        this.logError('Failed to refresh config', error);
        return of(false);
      })
    );
  }

  /**
   * Public API: Check if service is initialized
   */
  public isConfigInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Logging utilities
   */
  private log(message: string): void {
    // Silent logging
  }

  private logError(message: string, error: any): void {
    // Silent error logging
  }
}