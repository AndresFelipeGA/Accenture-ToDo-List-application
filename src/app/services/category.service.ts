import { Injectable, inject, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly collectionName = 'categories';
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  constructor() {
    // Service initialized - ready for operations
  }

  private logError(operation: string, error: any): void {
    // Error handling without console output - check browser dev tools if needed
  }

  // Crear nueva categoría
  createCategory(categoryData: CreateCategoryRequest): Observable<string> {
    const categoriesCollection = collection(this.firestore, this.collectionName);
    const now = Timestamp.now();
    
    const newCategory = {
      ...categoryData,
      createdAt: now,
      updatedAt: now
    };

    return from(this.ngZone.runOutsideAngular(() => addDoc(categoriesCollection, newCategory))).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        this.logError('createCategory', error);
        throw error;
      })
    );
  }

  // Obtener todas las categorías
  getCategories(): Observable<Category[]> {
    const categoriesCollection = collection(this.firestore, this.collectionName);
    const categoriesQuery = query(categoriesCollection, orderBy('name', 'asc'));
    
    return from(this.ngZone.runOutsideAngular(() => getDocs(categoriesQuery))).pipe(
      map(snapshot => {
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()['createdAt'].toDate(),
          updatedAt: doc.data()['updatedAt'].toDate()
        } as Category));
        return categories;
      }),
      catchError(error => {
        this.logError('getCategories', error);
        return of([]);
      })
    );
  }

  // Actualizar categoría
  updateCategory(categoryId: string, updates: UpdateCategoryRequest): Observable<void> {
    const categoryDoc = doc(this.firestore, this.collectionName, categoryId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    return from(this.ngZone.runOutsideAngular(() => updateDoc(categoryDoc, updateData))).pipe(
      catchError(error => {
        this.logError('updateCategory', error);
        throw error;
      })
    );
  }

  // Eliminar categoría
  deleteCategory(categoryId: string): Observable<void> {
    const categoryDoc = doc(this.firestore, this.collectionName, categoryId);
    return from(this.ngZone.runOutsideAngular(() => deleteDoc(categoryDoc))).pipe(
      catchError(error => {
        this.logError('deleteCategory', error);
        throw error;
      })
    );
  }
}