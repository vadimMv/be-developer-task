/**
 * Represents a user in the Mini Twitter system
 */
export class User {
  public readonly id: string;
  public readonly username: string;
  private followers: Set<string>; // User IDs who follow this user
  private following: Set<string>; // User IDs this user follows

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
    this.followers = new Set<string>();
    this.following = new Set<string>();
  }

  /**
   * Add a follower to this user
   * @param userId - ID of the user who is following
   */
  public addFollower(userId: string): void {
    this.followers.add(userId);
  }

  /**
   * Remove a follower from this user
   * @param userId - ID of the user to remove
   */
  public removeFollower(userId: string): void {
    this.followers.delete(userId);
  }

  /**
   * Follow another user
   * @param userId - ID of the user to follow
   */
  public follow(userId: string): void {
    this.following.add(userId);
  }

  /**
   * Unfollow another user
   * @param userId - ID of the user to unfollow
   */
  public unfollow(userId: string): void {
    this.following.delete(userId);
  }

  /**
   * Get all users this user follows
   * @returns Array of user IDs
   */
  public getFollowing(): string[] {
    return Array.from(this.following);
  }

  /**
   * Get all followers of this user
   * @returns Array of user IDs
   */
  public getFollowers(): string[] {
    return Array.from(this.followers);
  }

  /**
   * Check if this user follows another user
   * @param userId - ID of the user to check
   * @returns true if following, false otherwise
   */
  public isFollowing(userId: string): boolean {
    return this.following.has(userId);
  }

  /**
   * Check if a user follows this user
   * @param userId - ID of the user to check
   * @returns true if they follow, false otherwise
   */
  public isFollowedBy(userId: string): boolean {
    return this.followers.has(userId);
  }

  /**
   * Get follower count
   */
  public getFollowerCount(): number {
    return this.followers.size;
  }

  /**
   * Get following count
   */
  public getFollowingCount(): number {
    return this.following.size;
  }
}
