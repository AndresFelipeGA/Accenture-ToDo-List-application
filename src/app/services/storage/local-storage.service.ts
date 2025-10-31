import { Injectable } from '@angular/core';
import { IStorageService } from './storage.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements IStorageService {
  
  async setItem<T>(key: string, data: T): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      throw new Error(`Failed to store data for key "${key}": ${error}`);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      throw new Error(`Failed to retrieve data for key "${key}": ${error}`);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove data for key "${key}": ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear localStorage: ${error}`);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      throw new Error(`Failed to get all keys: ${error}`);
    }
  }
}