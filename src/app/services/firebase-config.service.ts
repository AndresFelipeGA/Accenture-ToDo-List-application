import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from 'firebase/remote-config';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {
  private remoteConfig: RemoteConfig | null = null;
  private isInitialized = false;
  
  private darkModeEnabledSubject = new BehaviorSubject<boolean>(false);
  public readonly darkModeEnabled$ = this.darkModeEnabledSubject.asObservable();

  private readonly defaultValues = {
    dark_mode_enabled: true,
    app_version_required: '1.0.0',
    maintenance_mode: false
  };

  constructor() {
    this.initializeFirebase();
  }

  private async initializeFirebase(): Promise<void> {
    try {
      const app = initializeApp(environment.firebase);
      
      this.remoteConfig = getRemoteConfig(app);
      
      this.remoteConfig.settings = {
        minimumFetchIntervalMillis: environment.production ? 3600000 : 0, // 1 hour in prod, 0 in dev
        fetchTimeoutMillis: 10000 // 10 seconds timeout
      };

      await this.setDefaults();
      
      await this.fetchAndActivateConfig();
      
      this.isInitialized = true;
      this.logDebug('Firebase Remote Config initialized successfully');
      
    } catch (error) {
      this.logError('Failed to initialize Firebase Remote Config', error);
      this.useDefaultValues();
    }
  }

  private async setDefaults(): Promise<void> {
    if (!this.remoteConfig) return;
    
    try {
      const stringDefaults: Record<string, string> = {};
      Object.entries(this.defaultValues).forEach(([key, value]) => {
        stringDefaults[key] = String(value);
      });
      
      this.logDebug('Default values set for Remote Config');
      
    } catch (error) {
      this.logError('Failed to set default values', error);
    }
  }

  private async fetchAndActivateConfig(): Promise<void> {
    if (!this.remoteConfig) return;

    try {
      const activated = await fetchAndActivate(this.remoteConfig);
      
      if (activated) {
        this.logDebug('Remote Config fetched and activated');
        this.updateFeatureFlags();
      } else {
        this.logDebug('Remote Config fetched but not activated (no changes)');
        this.updateFeatureFlags();
      }
      
    } catch (error) {
      this.logError('Failed to fetch Remote Config', error);
      this.useDefaultValues();
    }
  }

  private updateFeatureFlags(): void {
    try {
      const darkModeValue = this.getBooleanValue('dark_mode_enabled');
      this.darkModeEnabledSubject.next(darkModeValue);
      
      this.logDebug(`Feature flags updated - Dark Mode: ${darkModeValue}`);
      
    } catch (error) {
      this.logError('Failed to update feature flags', error);
      this.useDefaultValues();
    }
  }

  private useDefaultValues(): void {
    this.darkModeEnabledSubject.next(this.defaultValues.dark_mode_enabled);
    this.logDebug('Using default values for feature flags');
  }

  private getBooleanValue(key: string): boolean {
    if (!this.remoteConfig) {
      return this.defaultValues[key as keyof typeof this.defaultValues] as boolean;
    }

    try {
      const value = getValue(this.remoteConfig, key);
      return value.asBoolean();
    } catch (error) {
      this.logError(`Failed to get boolean value for key: ${key}`, error);
      return this.defaultValues[key as keyof typeof this.defaultValues] as boolean;
    }
  }

  private getStringValue(key: string): string {
    if (!this.remoteConfig) {
      return String(this.defaultValues[key as keyof typeof this.defaultValues]);
    }

    try {
      const value = getValue(this.remoteConfig, key);
      return value.asString();
    } catch (error) {
      this.logError(`Failed to get string value for key: ${key}`, error);
      return String(this.defaultValues[key as keyof typeof this.defaultValues]);
    }
  }

  public refreshConfig(): Observable<boolean> {
    if (!this.isInitialized) {
      return of(false);
    }

    return from(this.fetchAndActivateConfig()).pipe(
      map(() => true),
      catchError((error) => {
        this.logError('Failed to refresh config', error);
        return of(false);
      })
    );
  }

  public isDarkModeEnabled(): boolean {
    return this.darkModeEnabledSubject.value;
  }

  public isConfigInitialized(): boolean {
    return this.isInitialized;
  }

  private logDebug(message: string): void {
    if (!environment.production) {
      console.log(`[FirebaseConfigService] ${message}`);
    }
  }

  private logError(message: string, error: any): void {
    console.error(`[FirebaseConfigService] ${message}:`, error);
  }
}