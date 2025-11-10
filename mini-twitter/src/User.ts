/**
 * Represents a user in the Mini Twitter system
 */
export class User {

    readonly id: string;
    readonly username: string;
    private followers: Set<string>;
    private following: Set<string>;

    constructor(id: string, username: string) {
        this.id = id
        this.username = username;
        this.followers = new Set();
        this.following = new Set();
    }


    getFollowerCount(): number {
        return this.followers.size;
    }

    getFollowingCount(): number {
        return this.following.size;
    }

    getFollowers(): Set<string> {
        return this.followers;
    }

    getFollowing(): Set<string> {
        return this.following;
    }

    addFollower(followerId: string): void {
        this.followers.add(followerId);
    }

    follow(userId: string): void {
        this.following.add(userId);
    }

    removeFollower(followerId: string): void {
        if (!this.followers.has(followerId)) {
            throw new Error('Follower not found');
        }
        this.followers.delete(followerId);
    }
    
    unfollow(userId: string): void {
        if (!this.following.has(userId)) {
            throw new Error('Not following this user');
        }
        this.following.delete(userId);
    }
}
