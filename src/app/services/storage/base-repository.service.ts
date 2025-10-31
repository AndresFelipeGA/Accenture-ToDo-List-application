import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { IStorageService, IRepository } from './storage.interface';

/**
 * Base repository implementation following DRY and SOLID principles
 * Provides common CRUD operations for entities with ID generation
 */
@Injectable()
export abstract class BaseRepository<T extends { id?: string; createdAt: Date; updatedAt: Date }, TCreate, TUpdate> 
  implements IRepository<T, TCreate, TUpdate> {

  protected constructor(
    protected storageService: IStorageService,
    protected storageKey: string
  ) {}

  /**
   * Generate a unique ID for new entities
   * @returns A unique string ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all entities from storage
   * @returns Promise that resolves with array of all entities
   */
  async getAll(): Promise<T[]> {
    try {
      const entities = await this.storageService.getItem<T[]>(this.storageKey);
      return entities || [];
    } catch (error) {
      console.error(`[${this.constructor.name}] Error getting all entities:`, error);
      return [];
    }
  }

  /**
   * Get entity by ID
   * @param id - The entity ID
   * @returns Promise that resolves with the entity or null if not found
   */
  async getById(id: string): Promise<T | null> {
    try {
      const entities = await this.getAll();
      return entities.find(entity => entity.id === id) || null;
    } catch (error) {
      console.error(`[${this.constructor.name}] Error getting entity by ID:`, error);
      return null;
    }
  }

  /**
   * Create a new entity
   * @param data - The data to create the entity with
   * @returns Promise that resolves with the created entity ID
   */
  async create(data: TCreate): Promise<string> {
    try {
      const entities = await this.getAll();
      const id = this.generateId();
      const now = new Date();
      
      const newEntity = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now
      } as unknown as T;

      entities.push(newEntity);
      await this.storageService.setItem(this.storageKey, entities);
      
      return id;
    } catch (error) {
      console.error(`[${this.constructor.name}] Error creating entity:`, error);
      throw error;
    }
  }

  /**
   * Update an entity
   * @param id - The entity ID
   * @param updates - The updates to apply
   * @returns Promise that resolves when entity is updated
   */
  async update(id: string, updates: TUpdate): Promise<void> {
    try {
      const entities = await this.getAll();
      const entityIndex = entities.findIndex(entity => entity.id === id);
      
      if (entityIndex === -1) {
        throw new Error(`Entity with ID ${id} not found`);
      }

      const updatedEntity = {
        ...entities[entityIndex],
        ...updates,
        updatedAt: new Date()
      };

      entities[entityIndex] = updatedEntity;
      await this.storageService.setItem(this.storageKey, entities);
    } catch (error) {
      console.error(`[${this.constructor.name}] Error updating entity:`, error);
      throw error;
    }
  }

  /**
   * Delete an entity
   * @param id - The entity ID
   * @returns Promise that resolves when entity is deleted
   */
  async delete(id: string): Promise<void> {
    try {
      const entities = await this.getAll();
      const filteredEntities = entities.filter(entity => entity.id !== id);
      
      if (entities.length === filteredEntities.length) {
        throw new Error(`Entity with ID ${id} not found`);
      }

      await this.storageService.setItem(this.storageKey, filteredEntities);
    } catch (error) {
      console.error(`[${this.constructor.name}] Error deleting entity:`, error);
      throw error;
    }
  }

  /**
   * Convert async operations to Observable for Angular compatibility
   * @param asyncOperation - The async operation to convert
   * @returns Observable that emits the result
   */
  protected toObservable<R>(asyncOperation: Promise<R>): Observable<R> {
    return from(asyncOperation).pipe(
      catchError(error => {
        console.error(`[${this.constructor.name}] Observable error:`, error);
        throw error;
      })
    );
  }
}