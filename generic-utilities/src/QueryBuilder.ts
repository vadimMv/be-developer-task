/**
 * Fluent Query Builder with method chaining and type safety
 * @template T - The entity type to build queries for
 */
export class QueryBuilder<T> {
    private selectedFields: string[] = [];
    private whereConditions: string[] = [];
    private orderByClause: string = '';
    private limitClause: string = '';
    private tableName: string;

    constructor(tableName?: string) {
        this.tableName = tableName || 'table';
    }

    /**
     * Select specific fields from the entity
     * @param fields - Fields to select
     * @returns QueryBuilder with only the selected fields in the type
     */
    select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>> {
        this.selectedFields = fields.map(f => String(f));
        return this as any;
    }

    /**
     * Add WHERE conditions to the query
     * @param condition - Partial object with field-value pairs
     * @returns QueryBuilder for chaining
     */
    where(condition: Partial<T>): QueryBuilder<T> {
        const conditions = Object.entries(condition).map(
            ([key, value]) => {
                if (typeof value === 'string') {
                    return `${key} = '${value}'`;
                }
                return `${key} = ${value}`;
            }
        );
        this.whereConditions.push(...conditions);
        return this;
    }

    /**
     * Add ORDER BY clause to the query
     * @param field - Field to order by
     * @param direction - Sort direction ('asc' or 'desc')
     * @returns QueryBuilder for chaining
     */
    orderBy<K extends keyof T>(field: K, direction: 'asc' | 'desc'): QueryBuilder<T> {
        this.orderByClause = `ORDER BY ${String(field)} ${direction.toUpperCase()}`;
        return this;
    }

    /**
     * Add LIMIT clause to the query
     * @param count - Maximum number of results
     * @returns QueryBuilder for chaining
     */
    limit(count: number): QueryBuilder<T> {
        this.limitClause = `LIMIT ${count}`;
        return this;
    }

    /**
     * Build and return the final SQL query string
     * @returns SQL query string
     */
    build(): string {
        const parts: string[] = [];

        // SELECT clause
        if (this.selectedFields.length > 0) {
            parts.push(`SELECT ${this.selectedFields.join(', ')}`);
        } else {
            parts.push('SELECT *');
        }

        // FROM clause
        parts.push(`FROM ${this.tableName}`);

        // WHERE clause
        if (this.whereConditions.length > 0) {
            parts.push(`WHERE ${this.whereConditions.join(' AND ')}`);
        }

        // ORDER BY clause
        if (this.orderByClause) {
            parts.push(this.orderByClause);
        }

        // LIMIT clause
        if (this.limitClause) {
            parts.push(this.limitClause);
        }

        return parts.join(' ');
    }

    /**
     * Set the table name for the query
     * @param name - Table name
     * @returns QueryBuilder for chaining
     */
    from(name: string): QueryBuilder<T> {
        this.tableName = name;
        return this;
    }

    /**
     * Reset the query builder to initial state
     * @returns QueryBuilder for chaining
     */
    reset(): QueryBuilder<T> {
        this.selectedFields = [];
        this.whereConditions = [];
        this.orderByClause = '';
        this.limitClause = '';
        return this;
    }
}
