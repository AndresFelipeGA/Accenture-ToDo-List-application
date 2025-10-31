import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseRepository } from './base-repository.service';
import { LocalStorageService } from './local-storage.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../models/category.interface';

/**
 * Category repository implementation following Single Responsibility Principle
 * Handles category-specific data operations and business logic
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryRepository extends BaseRepository<Category, CreateCategoryRequest, UpdateCategoryRequest> {
  private static readonly STORAGE_KEY = 'accenture_categories';

  constructor(storageService: LocalStorageService) {
    super(storageService, CategoryRepository.STORAGE_KEY);
  }

  /**
   * Get all categories as Observable for Angular compatibility
   * @returns Observable that emits array of all categories sorted by name
   */
  getAllCategories(): Observable<Category[]> {
    const sortedCategories = this.getAll().then(categories => 
      categories.sort((a, b) => a.name.localeCompare(b.name))
    );
    return this.toObservable(sortedCategories);
  }

  /**
   * Create a new category
   * @param categoryData - The category data to create
   * @returns Observable that emits the created category ID
   */
  createCategory(categoryData: CreateCategoryRequest): Observable<string> {
    return this.toObservable(this.create(categoryData));
  }

  /**
   * Update a category
   * @param categoryId - The category ID to update
   * @param updates - The updates to apply
   * @returns Observable that completes when category is updated
   */
  updateCategory(categoryId: string, updates: UpdateCategoryRequest): Observable<void> {
    return this.toObservable(this.update(categoryId, updates));
  }

  /**
   * Delete a category
   * @param categoryId - The category ID to delete
   * @returns Observable that completes when category is deleted
   */
  deleteCategory(categoryId: string): Observable<void> {
    return this.toObservable(this.delete(categoryId));
  }

  /**
   * Get category by name
   * @param name - The category name to search for
   * @returns Observable that emits the category or null if not found
   */
  getCategoryByName(name: string): Observable<Category | null> {
    const categoryByName = this.getAll().then(categories => 
      categories.find(category => category.name.toLowerCase() === name.toLowerCase()) || null
    );
    return this.toObservable(categoryByName);
  }

  /**
   * Check if category name exists
   * @param name - The category name to check
   * @param excludeId - Optional ID to exclude from the check (for updates)
   * @returns Observable that emits true if name exists, false otherwise
   */
  categoryNameExists(name: string, excludeId?: string): Observable<boolean> {
    const nameExists = this.getAll().then(categories => 
      categories.some(category => 
        category.name.toLowerCase() === name.toLowerCase() && 
        category.id !== excludeId
      )
    );
    return this.toObservable(nameExists);
  }

  /**
   * Get categories by color
   * @param color - The color to filter by
   * @returns Observable that emits array of categories with the specified color
   */
  getCategoriesByColor(color: string): Observable<Category[]> {
    const categoriesByColor = this.getAll().then(categories => 
      categories.filter(category => category.color === color)
    );
    return this.toObservable(categoriesByColor);
  }

  /**
   * Get category statistics
   * @returns Observable that emits category statistics
   */
  getCategoryStats(): Observable<{ total: number; colors: { [color: string]: number } }> {
    const stats = this.getAll().then(categories => {
      const colorStats: { [color: string]: number } = {};
      
      categories.forEach(category => {
        colorStats[category.color] = (colorStats[category.color] || 0) + 1;
      });

      return {
        total: categories.length,
        colors: colorStats
      };
    });
    
    return this.toObservable(stats);
  }
}