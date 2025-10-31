import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseRepository } from './base-repository.service';
import { LocalStorageService } from './local-storage.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.interface';

/**
 * Task repository implementation following Single Responsibility Principle
 * Handles task-specific data operations and business logic
 */
@Injectable({
  providedIn: 'root'
})
export class TaskRepository extends BaseRepository<Task, CreateTaskRequest, UpdateTaskRequest> {
  private static readonly STORAGE_KEY = 'accenture_tasks';

  constructor(storageService: LocalStorageService) {
    super(storageService, TaskRepository.STORAGE_KEY);
  }

  /**
   * Get all tasks as Observable for Angular compatibility
   * @returns Observable that emits array of all tasks
   */
  getAllTasks(): Observable<Task[]> {
    return this.toObservable(this.getAll());
  }

  /**
   * Get tasks filtered by category
   * @param categoryId - The category ID to filter by
   * @returns Observable that emits array of tasks in the specified category
   */
  getTasksByCategory(categoryId: string): Observable<Task[]> {
    const filteredTasks = this.getAll().then(tasks => 
      tasks.filter(task => task.categoryId === categoryId)
    );
    return this.toObservable(filteredTasks);
  }

  /**
   * Get tasks filtered by completion status
   * @param completed - The completion status to filter by
   * @returns Observable that emits array of tasks with the specified completion status
   */
  getTasksByStatus(completed: boolean): Observable<Task[]> {
    const filteredTasks = this.getAll().then(tasks => 
      tasks.filter(task => task.completed === completed)
    );
    return this.toObservable(filteredTasks);
  }

  /**
   * Create a new task
   * @param taskData - The task data to create
   * @returns Observable that emits the created task ID
   */
  createTask(taskData: CreateTaskRequest): Observable<string> {
    return this.toObservable(this.create(taskData));
  }

  /**
   * Update a task
   * @param taskId - The task ID to update
   * @param updates - The updates to apply
   * @returns Observable that completes when task is updated
   */
  updateTask(taskId: string, updates: UpdateTaskRequest): Observable<void> {
    return this.toObservable(this.update(taskId, updates));
  }

  /**
   * Toggle task completion status
   * @param taskId - The task ID to toggle
   * @param completed - The new completion status
   * @returns Observable that completes when task is updated
   */
  toggleTaskCompletion(taskId: string, completed: boolean): Observable<void> {
    return this.updateTask(taskId, { completed });
  }

  /**
   * Delete a task
   * @param taskId - The task ID to delete
   * @returns Observable that completes when task is deleted
   */
  deleteTask(taskId: string): Observable<void> {
    return this.toObservable(this.delete(taskId));
  }

  /**
   * Search tasks by title or description
   * @param searchTerm - The term to search for
   * @returns Observable that emits array of matching tasks
   */
  searchTasks(searchTerm: string): Observable<Task[]> {
    const searchResults = this.getAll().then(tasks => 
      tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
    return this.toObservable(searchResults);
  }

  /**
   * Get tasks count by category
   * @param categoryId - The category ID
   * @returns Observable that emits the count of tasks in the category
   */
  getTasksCountByCategory(categoryId: string): Observable<number> {
    const count = this.getAll().then(tasks => 
      tasks.filter(task => task.categoryId === categoryId).length
    );
    return this.toObservable(count);
  }
}