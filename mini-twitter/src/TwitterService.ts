import { User } from './User';
import { Tweet } from './Tweet';

/**
 * Main service for the Mini Twitter system
 * Manages users, tweets, and social interactions
 */
export class TwitterService {
  private users: Map<string, User>;
  private tweets: Tweet[];
  private nextUserId: number;
  private nextTweetId: number;

  constructor() {
    this.users = new Map<string, User>();
    this.tweets = [];
    this.nextUserId = 1;
    this.nextTweetId = 1;
  }

  /**
   * Create a new user
   * @param username - Username for the new user
   * @returns The created User object
   */
  public createUser(username: string): User {
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }

    const userId = `user_${this.nextUserId++}`;
    const user = new User(userId, username);
    this.users.set(userId, user);
    return user;
  }

  /**
   * Get a user by ID
   * @param userId - ID of the user to retrieve
   * @returns User object or undefined if not found
   */
  public getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get a user by username
   * @param username - Username to search for
   * @returns User object or undefined if not found
   */
  public getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  /**
   * Get all users in the system
   * @returns Array of all users
   */
  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Make one user follow another
   * @param followerId - ID of the user who wants to follow
   * @param followeeId - ID of the user to be followed
   */
  public followUser(followerId: string, followeeId: string): void {
    if (followerId === followeeId) {
      throw new Error('Users cannot follow themselves');
    }

    const follower = this.users.get(followerId);
    const followee = this.users.get(followeeId);

    if (!follower) {
      throw new Error(`Follower user not found: ${followerId}`);
    }

    if (!followee) {
      throw new Error(`Followee user not found: ${followeeId}`);
    }

    // Bidirectional update
    follower.follow(followeeId);
    followee.addFollower(followerId);
  }

  /**
   * Make one user unfollow another
   * @param followerId - ID of the user who wants to unfollow
   * @param followeeId - ID of the user to be unfollowed
   */
  public unfollowUser(followerId: string, followeeId: string): void {
    const follower = this.users.get(followerId);
    const followee = this.users.get(followeeId);

    if (!follower) {
      throw new Error(`Follower user not found: ${followerId}`);
    }

    if (!followee) {
      throw new Error(`Followee user not found: ${followeeId}`);
    }

    // Bidirectional update
    follower.unfollow(followeeId);
    followee.removeFollower(followerId);
  }

  /**
   * Post a new tweet
   * @param userId - ID of the user posting the tweet
   * @param content - Content of the tweet
   * @returns The created Tweet object
   */
  public postTweet(userId: string, content: string): Tweet {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const tweetId = `tweet_${this.nextTweetId++}`;
    const tweet = new Tweet(tweetId, userId, content);
    this.tweets.push(tweet);
    return tweet;
  }

  /**
   * Get a user's wall/feed
   * Includes tweets from the user and all users they follow
   * Sorted by timestamp (newest first)
   *
   * @param userId - ID of the user whose wall to retrieve
   * @returns Array of tweets sorted by timestamp (newest first)
   */
  public getWall(userId: string): Tweet[] {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get IDs of users whose tweets should appear on the wall
    // This includes the user themselves and all users they follow
    const relevantUserIds = new Set<string>([userId, ...user.getFollowing()]);

    // Filter tweets to only include those from relevant users
    const wallTweets = this.tweets.filter((tweet) =>
      relevantUserIds.has(tweet.userId)
    );

    // Sort by timestamp (newest first)
    return wallTweets.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get all tweets by a specific user
   * @param userId - ID of the user
   * @returns Array of tweets sorted by timestamp (newest first)
   */
  public getUserTweets(userId: string): Tweet[] {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    return this.tweets
      .filter((tweet) => tweet.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get total number of tweets in the system
   */
  public getTweetCount(): number {
    return this.tweets.length;
  }

  /**
   * Get total number of users in the system
   */
  public getUserCount(): number {
    return this.users.size;
  }

  /**
   * Clear all data (useful for testing)
   */
  public clear(): void {
    this.users.clear();
    this.tweets = [];
    this.nextUserId = 1;
    this.nextTweetId = 1;
  }
}
