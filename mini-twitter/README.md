# Mini Twitter

A simplified Twitter-like social network system implemented in TypeScript with clean object-oriented design.

## Features

- **User Management**: Create users with unique IDs
- **Follow System**: Users can follow/unfollow other users
- **Tweet Posting**: Users can post text tweets (up to 280 characters)
- **Personalized Wall**: View a feed of tweets from yourself and users you follow, sorted by time (newest first)

## Project Structure

```
mini-twitter/
├── src/
│   ├── User.ts              # User class with follow/follower management
│   ├── Tweet.ts             # Tweet class with content and timestamp
│   ├── TwitterService.ts    # Main service orchestrating the system
│   └── index.ts             # Public API exports
├── tests/
│   └── example.ts           # Example usage and test cases
├── DESIGN.md                # Detailed design documentation
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project metadata and scripts
```

## Installation

```bash
cd mini-twitter
npm install
```

## Usage

### Build the Project

```bash
npm run build
```

### Run the Example

```bash
npm test
```

### Use in Your Code

```typescript
import { TwitterService } from './src/TwitterService';

// Initialize the service
const twitter = new TwitterService();

// Create users
const alice = twitter.createUser('alice');
const bob = twitter.createUser('bob');

// Alice follows Bob
twitter.followUser(alice.id, bob.id);

// Post tweets
twitter.postTweet(alice.id, 'Hello world!');
twitter.postTweet(bob.id, 'My first tweet!');

// Get Alice's wall (includes her tweets + Bob's tweets)
const wall = twitter.getWall(alice.id);
wall.forEach(tweet => {
  const author = twitter.getUser(tweet.userId);
  console.log(`@${author?.username}: ${tweet.content}`);
});
```

## API Reference

### TwitterService

Main service class for managing the entire system.

#### User Management

- `createUser(username: string): User`
  - Creates a new user with a unique ID
  - Returns the created User object

- `getUser(userId: string): User | undefined`
  - Retrieves a user by their ID
  - Returns undefined if user not found

- `getUserByUsername(username: string): User | undefined`
  - Retrieves a user by their username
  - Returns undefined if user not found

- `getAllUsers(): User[]`
  - Returns array of all users in the system

#### Follow Operations

- `followUser(followerId: string, followeeId: string): void`
  - Makes one user follow another
  - Throws error if either user doesn't exist
  - Throws error if user tries to follow themselves

- `unfollowUser(followerId: string, followeeId: string): void`
  - Makes one user unfollow another
  - Throws error if either user doesn't exist

#### Tweet Operations

- `postTweet(userId: string, content: string): Tweet`
  - Posts a new tweet for a user
  - Content must be 1-280 characters
  - Returns the created Tweet object
  - Throws error if user doesn't exist or content is invalid

- `getUserTweets(userId: string): Tweet[]`
  - Gets all tweets by a specific user
  - Returns tweets sorted by timestamp (newest first)

#### Feed Operations

- `getWall(userId: string): Tweet[]`
  - Gets a user's personalized wall/feed
  - Includes tweets from the user and all users they follow
  - Returns tweets sorted by timestamp (newest first)
  - Throws error if user doesn't exist

#### Statistics

- `getUserCount(): number` - Total number of users
- `getTweetCount(): number` - Total number of tweets
- `clear(): void` - Clears all data (useful for testing)

### User

Represents a user in the system.

**Properties:**
- `id: string` (readonly) - Unique user identifier
- `username: string` (readonly) - User's username

**Methods:**
- `getFollowing(): string[]` - Get IDs of users this user follows
- `getFollowers(): string[]` - Get IDs of users who follow this user
- `isFollowing(userId: string): boolean` - Check if following a user
- `isFollowedBy(userId: string): boolean` - Check if followed by a user
- `getFollowerCount(): number` - Get number of followers
- `getFollowingCount(): number` - Get number of users following

### Tweet

Represents a tweet in the system.

**Properties:**
- `id: string` (readonly) - Unique tweet identifier
- `userId: string` (readonly) - ID of the user who posted
- `content: string` (readonly) - Tweet text content
- `timestamp: Date` (readonly) - When the tweet was created

**Methods:**
- `toString(): string` - Format tweet for display
- `getAge(): number` - Get age of tweet in milliseconds
- `compareTo(other: Tweet): number` - Compare tweets by timestamp

## Design Highlights

### Architecture

The system uses a **centralized service pattern** with three main components:

1. **User**: Manages user identity and follow relationships
2. **Tweet**: Immutable tweet objects with timestamp
3. **TwitterService**: Coordinates all operations and maintains data consistency

### Key Design Decisions

1. **In-Memory Storage**: Simple Map/Set/Array data structures for fast operations
2. **Bidirectional Relationships**: Both followers and following tracked for O(1) operations
3. **Immutable Tweets**: Tweets cannot be edited after creation
4. **Time Ordering**: Wall always shows newest tweets first

### Performance

- **Follow/Unfollow**: O(1) - constant time using Sets
- **Post Tweet**: O(1) - append to array
- **Get Wall**: O(T log T) where T = number of relevant tweets
  - Filtering is O(T) where T = total tweets
  - Sorting is O(T log T) where T = relevant tweets

### Scalability Considerations

Current implementation is optimized for:
- Thousands of users
- Tens of thousands of tweets
- Hundreds of follows per user

For larger scale, consider:
- Database persistence (PostgreSQL, MongoDB)
- Caching layer (Redis)
- Fan-out on write pattern
- Pagination for wall queries

## Example Output

```
=== Mini Twitter Example ===

1. Creating users...
   Created: alice (user_1)
   Created: bob (user_2)
   Created: charlie (user_3)

2. Setting up follow relationships...
   alice follows bob
   alice follows charlie
   bob follows charlie

3. Posting tweets...
   alice: "Hello Twitter! This is my first tweet!"
   bob: "Beautiful day for coding!"
   charlie: "TypeScript is awesome!"
   alice: "Just followed some interesting people!"
   bob: "Working on a new project..."
   charlie: "Anyone up for a code review?"

4. Viewing walls (newest tweets first)...

=== alice's Wall ===
(Shows tweets from alice + users they follow: bob, charlie)
   [@charlie] Anyone up for a code review?
   [@bob] Working on a new project...
   [@alice] Just followed some interesting people!
   [@charlie] TypeScript is awesome!
   [@bob] Beautiful day for coding!
   [@alice] Hello Twitter! This is my first tweet!

=== bob's Wall ===
(Shows tweets from bob + users they follow: charlie)
   [@charlie] Anyone up for a code review?
   [@bob] Working on a new project...
   [@charlie] TypeScript is awesome!
   [@bob] Beautiful day for coding!

=== charlie's Wall ===
(Shows only charlie's tweets - follows nobody)
   [@charlie] Anyone up for a code review?
   [@charlie] TypeScript is awesome!
```

## Testing

The `tests/example.ts` file demonstrates:
- User creation
- Follow relationships
- Tweet posting
- Wall viewing
- Edge case handling (empty tweets, self-follows, invalid users)

Run with: `npm test`

## Error Handling

The system throws descriptive errors for:
- Empty or invalid usernames
- Empty tweet content
- Tweet content exceeding 280 characters
- Non-existent users
- Self-follow attempts

## Future Enhancements

Potential improvements:
- Likes/retweets
- Replies and threading
- Hashtags and mentions
- User profiles
- Direct messaging
- Media attachments
- Search functionality
- Notification system
- Database persistence
- REST API layer

## License

MIT

## Author

Built with TypeScript and clean OOP principles.
