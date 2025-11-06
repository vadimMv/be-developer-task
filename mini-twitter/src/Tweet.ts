/**
 * Represents a tweet in the Mini Twitter system
 */
export class Tweet {
  public readonly id: string;
  public readonly userId: string;
  public readonly content: string;
  public readonly timestamp: Date;

  constructor(id: string, userId: string, content: string, timestamp?: Date) {
    if (!content || content.trim().length === 0) {
      throw new Error('Tweet content cannot be empty');
    }

    if (content.length > 280) {
      throw new Error('Tweet content cannot exceed 280 characters');
    }

    this.id = id;
    this.userId = userId;
    this.content = content;
    this.timestamp = timestamp || new Date();
  }

  /**
   * Format tweet for display
   * @returns Formatted string representation
   */
  public toString(): string {
    return `[${this.timestamp.toISOString()}] User ${this.userId}: ${this.content}`;
  }

  /**
   * Get age of tweet in milliseconds
   */
  public getAge(): number {
    return Date.now() - this.timestamp.getTime();
  }

  /**
   * Compare tweets by timestamp for sorting
   * @param other - Tweet to compare with
   * @returns Negative if this is older, positive if newer, 0 if same time
   */
  public compareTo(other: Tweet): number {
    return other.timestamp.getTime() - this.timestamp.getTime();
  }
}
