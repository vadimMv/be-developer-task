import { User } from './User';
import { Tweet } from './Tweet';

/**
 * Main service for the Mini Twitter system
 * Manages users, tweets, and social interactions
 */
export class TwitterService {

    private users: User[];
    private tweets: Tweet[];
    private nextUserId = 1;
    private nextTweetId = 1;
    constructor() {
        this.users = [];
        this.tweets = [];
    }

    createUser(username: string): User {
        const userId = `user_${this.nextUserId++}`;
        const user = new User(userId, username);
        this.users.push(user);
        return user;
    }


    getUser(userId: string): User | undefined {
        return this.users.find(user => user.id === userId);
    }

    postTweet(userId: string, content: string): Tweet {
        const tweetId = `tweet_${this.nextTweetId++}`;
        const tweet = new Tweet(tweetId, userId, content, new Date());
        this.tweets.push(tweet);
        return tweet;
    }

    getuserByusername(username: string): User | undefined {
        return this.users.find(user => user.username === username);
    }

    getallUsers(): User[] {
        return this.users;
    }

    followUser(followerId: string, followeeId: string): void {

        const follower = this.getUser(followerId);
        const followee = this.getUser(followeeId);

        if(followerId === followeeId) {
            throw new Error('User cannot follow themselves');
        }
           
        if (!follower || !followee) {
            throw new Error('User not found');
        }

        follower.follow(followeeId);
        followee.addFollower(followerId);
    }

    getWall(userId: string): Tweet[] {
        const user = this.getUser(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const following = user.getFollowing();
        const wallTweets = this.tweets.filter(tweet =>
            tweet.userId === userId || following.has(tweet.userId)
        );
        return wallTweets.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    getUserCount(): number {
        return this.users.length;
    }
    getTweetCount(): number {
        return this.tweets.length;
    }

}
