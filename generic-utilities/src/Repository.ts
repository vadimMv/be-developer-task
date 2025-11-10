/**
 * Base entity interface that all entities must implement
 */
export interface Entity {
    id: string | number;
}

/**
 * Repository interface defining CRUD operations
 * @template T - Entity type that extends Entity
 */
export interface Repository<T extends Entity> {
    findById(id: T['id']): Promise<T | null>;
    findAll(): Promise<T[]>;
    findBy<K extends keyof T>(field: K, value: T[K]): Promise<T[]>;
    create(entity: Omit<T, 'id'>): Promise<T>;
    update(id: T['id'], updates: Partial<Omit<T, 'id'>>): Promise<T | null>;
    delete(id: T['id']): Promise<boolean>;
}

/**
 * In-memory implementation of the Repository interface
 * @template T - Entity type that extends Entity
 */
export class InMemoryRepository<T extends Entity> implements Repository<T> {
    private data: Map<T['id'], T> = new Map();
    private nextId = 1;

    /**
     * Find an entity by its ID
     * @param id - Entity ID
     * @returns Promise resolving to the entity or null if not found
     */
    async findById(id: T['id']): Promise<T | null> {
        return this.data.get(id) ?? null;
    }

    /**
     * Get all entities
     * @returns Promise resolving to array of all entities
     */
    async findAll(): Promise<T[]> {
        return Array.from(this.data.values());
    }

    /**
     * Find entities by a specific field value
     * @param field - Field name to search by
     * @param value - Value to match
     * @returns Promise resolving to array of matching entities
     */
    async findBy<K extends keyof T>(field: K, value: T[K]): Promise<T[]> {
        const results: T[] = [];
        for (const entity of this.data.values()) {
            if (entity[field] === value) {
                results.push(entity);
            }
        }
        return results;
    }

    /**
     * Create a new entity
     * @param entity - Entity data without ID
     * @returns Promise resolving to the created entity with ID
     */
    async create(entity: Omit<T, 'id'>): Promise<T> {
        // Generate ID based on the type of the first entity's id or default to number
        let id: T['id'];

        // Check if we have any existing entities to determine ID type
        const firstEntity = this.data.values().next().value;
        if (firstEntity && typeof firstEntity.id === 'string') {
            id = String(this.nextId++) as T['id'];
        } else {
            id = this.nextId++ as T['id'];
        }

        const newEntity = { ...entity, id } as T;
        this.data.set(id, newEntity);
        return newEntity;
    }

    /**
     * Update an existing entity
     * @param id - Entity ID
     * @param updates - Partial entity updates (without ID)
     * @returns Promise resolving to the updated entity or null if not found
     */
    async update(id: T['id'], updates: Partial<Omit<T, 'id'>>): Promise<T | null> {
        const existing = this.data.get(id);
        if (!existing) {
            return null;
        }

        const updated = { ...existing, ...updates } as T;
        this.data.set(id, updated);
        return updated;
    }

    /**
     * Delete an entity by ID
     * @param id - Entity ID
     * @returns Promise resolving to true if deleted, false if not found
     */
    async delete(id: T['id']): Promise<boolean> {
        return this.data.delete(id);
    }

    /**
     * Clear all entities from the repository
     */
    async clear(): Promise<void> {
        this.data.clear();
        this.nextId = 1;
    }

    /**
     * Get the count of entities in the repository
     * @returns Promise resolving to the count
     */
    async count(): Promise<number> {
        return this.data.size;
    }

    /**
     * Check if an entity exists by ID
     * @param id - Entity ID
     * @returns Promise resolving to true if exists, false otherwise
     */
    async exists(id: T['id']): Promise<boolean> {
        return this.data.has(id);
    }
}
