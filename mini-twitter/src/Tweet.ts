/**
 * Represents a tweet in the Mini Twitter system
 */
export class Tweet {
    readonly userId: string;
    readonly id: string;
    readonly content: string;
    readonly timestamp: Date;
    constructor(id: string, userId: string, content: string, timestamp: Date) {
        this.id = id;
        this.userId = userId;
        this.content = content;
        this.timestamp = timestamp;
    }

    tostring(): string {
        return `Tweet(id=${this.id}, userId=${this.userId}, content=${this.content}, timestamp=${this.timestamp.toISOString()})`;
    }
    getage(): number {
        const now = new Date();
        return now.getTime() - this.timestamp.getTime();
    }

    compareTo(other: Tweet): number {
        return this.timestamp.getTime() - other.timestamp.getTime();
    }

}
