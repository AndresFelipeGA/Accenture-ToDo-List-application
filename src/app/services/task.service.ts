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
  where,
  Timestamp,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork
} from '@angular/fire/firestore';
import { Observable, from, of, map, catchError, tap } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly collectionName = 'tasks';
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  constructor() {
    // Service initialized - Firebase connection ready
  }

  // Enhanced error handling with diagnostic logging
  private logError(operation: string, error: any): void {
    console.error(`[TaskService] ${operation} failed:`, error);
  }

  // Diagnostic logging for debugging
  private logDebug(operation: string, message: string): void {
    console.log(`[TaskService DEBUG] ${operation}: ${message}`);
  }

  // Crear nueva tarea
  createTask(taskData: CreateTaskRequest): Observable<string> {
    this.logDebug('createTask', 'Starting task creation');
    const tasksCollection = collection(this.firestore, this.collectionName);
    const now = Timestamp.now();
    
    // Filtrar valores undefined para Firebase
    const newTask: any = {
      title: taskData.title,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    // Solo agregar campos si tienen valor
    if (taskData.description) {
      newTask.description = taskData.description;
    }
    
    if (taskData.categoryId) {
      newTask.categoryId = taskData.categoryId;
    }

    this.logDebug('createTask', 'About to call Firebase addDoc - INSIDE Angular zone');
    return from(addDoc(tasksCollection, newTask)).pipe(
      map(docRef => {
        this.logDebug('createTask', `Task created with ID: ${docRef.id} - INSIDE Angular zone`);
        return docRef.id;
      }),
      catchError(error => {
        this.logError('createTask', error);
        throw error;
      })
    );
  }

  // Obtener todas las tareas
  getTasks(): Observable<Task[]> {
    this.logDebug('getTasks', 'Starting task fetch');
    const tasksCollection = collection(this.firestore, this.collectionName);
    const tasksQuery = query(tasksCollection, orderBy('createdAt', 'desc'));
    
    this.logDebug('getTasks', 'About to call Firebase getDocs - INSIDE Angular zone');
    return from(getDocs(tasksQuery)).pipe(
      map(snapshot => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()['createdAt'].toDate(),
          updatedAt: doc.data()['updatedAt'].toDate()
        } as Task));
        this.logDebug('getTasks', `Fetched ${tasks.length} tasks - INSIDE Angular zone`);
        return tasks;
      }),
      catchError(error => {
        this.logError('getTasks', error);
        return of([]);
      })
    );
  }

  // Obtener tareas por categoría
  getTasksByCategory(categoryId: string): Observable<Task[]> {
    const tasksCollection = collection(this.firestore, this.collectionName);
    const tasksQuery = query(
      tasksCollection,
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(tasksQuery)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()['createdAt'].toDate(),
          updatedAt: doc.data()['updatedAt'].toDate()
        } as Task))
      ),
      catchError(error => {
        this.logError('getTasksByCategory', error);
        return of([]);
      })
    );
  }

  // Actualizar tarea
  updateTask(taskId: string, updates: UpdateTaskRequest): Observable<void> {
    const taskDoc = doc(this.firestore, this.collectionName, taskId);
    
    // Filtrar valores undefined para Firebase
    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    // Solo agregar campos si tienen valor
    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    
    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }
    
    if (updates.categoryId !== undefined) {
      updateData.categoryId = updates.categoryId;
    }
    
    return from(updateDoc(taskDoc, updateData));
  }

  // Marcar tarea como completada/no completada
  toggleTaskCompletion(taskId: string, completed: boolean): Observable<void> {
    return this.updateTask(taskId, { completed });
  }

  // Eliminar tarea
  deleteTask(taskId: string): Observable<void> {
    const taskDoc = doc(this.firestore, this.collectionName, taskId);
    return from(deleteDoc(taskDoc));
  }
}