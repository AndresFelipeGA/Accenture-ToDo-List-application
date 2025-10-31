import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.interface';
import { TaskRepository } from './storage/task-repository.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private taskRepository: TaskRepository) {}

  private logError(operation: string, error: any): void {
    console.error(`[TaskService] ${operation} failed:`, error);
  }

  private logDebug(operation: string, message: string): void {
    console.log(`[TaskService DEBUG] ${operation}: ${message}`);
  }

  createTask(taskData: CreateTaskRequest): Observable<string> {
    if (!taskData.title?.trim()) {
      throw new Error('Task title is required');
    }

    return this.taskRepository.createTask({
      title: taskData.title.trim(),
      description: taskData.description?.trim(),
      categoryId: taskData.categoryId
    });
  }

  getTasks(): Observable<Task[]> {
    return this.taskRepository.getAllTasks();
  }
getTasksByCategory(categoryId: string): Observable<Task[]> {
    
    if (!categoryId?.trim()) {
      throw new Error('Category ID is required');
    }

    return this.taskRepository.getTasksByCategory(categoryId);
  }
updateTask(taskId: string, updates: UpdateTaskRequest): Observable<void> {
    
    if (!taskId?.trim()) {
      throw new Error('Task ID is required');
    }

    const cleanUpdates: UpdateTaskRequest = {};
    
    if (updates.title !== undefined) {
      cleanUpdates.title = updates.title.trim();
    }
    
    if (updates.description !== undefined) {
      cleanUpdates.description = updates.description?.trim();
    }
    
    if (updates.completed !== undefined) {
      cleanUpdates.completed = updates.completed;
    }
    
    if (updates.categoryId !== undefined) {
      cleanUpdates.categoryId = updates.categoryId;
    }

    return this.taskRepository.updateTask(taskId, cleanUpdates);
  }
toggleTaskCompletion(taskId: string, completed: boolean): Observable<void> {
    
    if (!taskId?.trim()) {
      throw new Error('Task ID is required');
    }

    return this.taskRepository.toggleTaskCompletion(taskId, completed);
  }
deleteTask(taskId: string): Observable<void> {
    
    if (!taskId?.trim()) {
      throw new Error('Task ID is required');
    }

    return this.taskRepository.deleteTask(taskId);
  }
searchTasks(searchTerm: string): Observable<Task[]> {
    
    if (!searchTerm?.trim()) {
      return this.getTasks();
    }

    return this.taskRepository.searchTasks(searchTerm.trim());
  }

  getTasksByStatus(completed: boolean): Observable<Task[]> {
    return this.taskRepository.getTasksByStatus(completed);
  }

  getTasksCountByCategory(categoryId: string): Observable<number> {
    if (!categoryId?.trim()) {
      throw new Error('Category ID is required');
    }

    return this.taskRepository.getTasksCountByCategory(categoryId);
  }
}