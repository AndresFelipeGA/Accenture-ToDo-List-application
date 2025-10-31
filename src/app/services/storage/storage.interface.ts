/**
 * Storage interface following the Interface Segregation Principle (ISP)
 * Defines the contract for data persistence operations
 */
export interface IStorageService {
  /**
   * Store data in the storage system
   * @param key - The key to store the data under
   * @param data - The data to store
   * @returns Promise that resolves when data is stored
   */
  setItem<T>(key: string, data: T): Promise<void>;

  /**
   * Retrieve data from the storage system
   * @param key - The key to retrieve data for
   * @returns Promise that resolves with the data or null if not found
   */
  getItem<T>(key: string): Promise<T | null>;

  /**
   * Remove data from the storage system
   * @param key - The key to remove
   * @returns Promise that resolves when data is removed
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all data from the storage system
   * @returns Promise that resolves when all data is cleared
   */
  clear(): Promise<void>;

  /**
   * Get all keys in the storage system
   * @returns Promise that resolves with array of all keys
   */
  getAllKeys(): Promise<string[]>;
}

/**
 * Repository interface following the Repository Pattern
 * Defines the contract for entity-specific data operations
 */
export interface IRepository<T, TCreate, TUpdate> {
  /**
   * Create a new entity
   * @param data - The data to create the entity with
   * @returns Promise that resolves with the created entity ID
   */
  create(data: TCreate): Promise<string>;

  /**
   * Get all entities
   * @returns Promise that resolves with array of all entities
   */
  getAll(): Promise<T[]>;

  /**
   * Get entity by ID
   * @param id - The entity ID
   * @returns Promise that resolves with the entity or null if not found
   */
  getById(id: string): Promise<T | null>;

  /**
   * Update an entity
   * @param id - The entity ID
   * @param updates - The updates to apply
   * @returns Promise that resolves when entity is updated
   */
  update(id: string, updates: TUpdate): Promise<void>;

  /**
   * Delete an entity
   * @param id - The entity ID
   * @returns Promise that resolves when entity is deleted
   */
  delete(id: string): Promise<void>;
}