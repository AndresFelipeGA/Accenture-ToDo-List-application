import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.interface';
import { CategoryRepository } from './storage/category-repository.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private categoryRepository: CategoryRepository) {}

  private logError(operation: string, error: any): void {
    console.error(`[CategoryService] ${operation} failed:`, error);
  }

  private logDebug(operation: string, message: string): void {
    console.log(`[CategoryService DEBUG] ${operation}: ${message}`);
  }

  createCategory(categoryData: CreateCategoryRequest): Observable<string> {
    if (!categoryData.name?.trim()) {
      throw new Error('Category name is required');
    }

    if (!categoryData.color?.trim()) {
      throw new Error('Category color is required');
    }

    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(categoryData.color)) {
      throw new Error('Category color must be a valid hex color');
    }

    return this.categoryRepository.createCategory({
      name: categoryData.name.trim(),
      color: categoryData.color.toLowerCase()
    });
  }

  getCategories(): Observable<Category[]> {
    return this.categoryRepository.getAllCategories();
  }
updateCategory(categoryId: string, updates: UpdateCategoryRequest): Observable<void> {
    
    if (!categoryId?.trim()) {
      throw new Error('Category ID is required');
    }

    const cleanUpdates: UpdateCategoryRequest = {};
    
    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        throw new Error('Category name cannot be empty');
      }
      cleanUpdates.name = updates.name.trim();
    }
    
    if (updates.color !== undefined) {
      if (!updates.color.trim()) {
        throw new Error('Category color cannot be empty');
      }
      
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(updates.color)) {
        throw new Error('Category color must be a valid hex color');
      }
      
      cleanUpdates.color = updates.color.toLowerCase();
    }

    return this.categoryRepository.updateCategory(categoryId, cleanUpdates);
  }
deleteCategory(categoryId: string): Observable<void> {
    
    if (!categoryId?.trim()) {
      throw new Error('Category ID is required');
    }

    return this.categoryRepository.deleteCategory(categoryId);
  }
getCategoryByName(name: string): Observable<Category | null> {
    
    if (!name?.trim()) {
      throw new Error('Category name is required');
    }

    return this.categoryRepository.getCategoryByName(name.trim());
  }
categoryNameExists(name: string, excludeId?: string): Observable<boolean> {
    
    if (!name?.trim()) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.categoryRepository.categoryNameExists(name.trim(), excludeId);
  }
getCategoriesByColor(color: string): Observable<Category[]> {
    
    if (!color?.trim()) {
      throw new Error('Color is required');
    }

    return this.categoryRepository.getCategoriesByColor(color.toLowerCase());
  }

  getCategoryStats(): Observable<{ total: number; colors: { [color: string]: number } }> {
    return this.categoryRepository.getCategoryStats();
  }
getCategoryById(categoryId: string): Observable<Category | null> {
    
    if (!categoryId?.trim()) {
      throw new Error('Category ID is required');
    }

    return new Observable(observer => {
      this.categoryRepository.getById(categoryId)
        .then(category => {
          observer.next(category);
          observer.complete();
        })
        .catch(error => {
          this.logError('getCategoryById', error);
          observer.error(error);
        });
    });
  }
}