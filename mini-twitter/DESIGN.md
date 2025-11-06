# Mini Twitter - Design Document

## Overview
A simplified Twitter-like system that allows users to follow others, post tweets, and view their personalized wall/feed.

## Requirements
1. User can follow another user
2. User can post a Tweet (text)
3. User can get their wall - includes tweets from followees + self - ordered by post time (newest to oldest)

## System Design

### Architecture
The system follows object-oriented design principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    TwitterService                        │
│  (Main orchestrator - manages users and tweets)          │
└─────────────────────────────────────────────────────────┘
                    │
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼────┐            ┌─────▼─────┐
   │  User   │            │   Tweet   │
   └─────────┘            └───────────┘
```

### Data Models

#### User
- **id**: string (unique identifier)
- **username**: string
- **followers**: Set<string> (user IDs who follow this user)
- **following**: Set<string> (user IDs this user follows)

#### Tweet
- **id**: string (unique identifier)
- **userId**: string (author's user ID)
- **content**: string (tweet text)
- **timestamp**: Date (creation time)

#### TwitterService
Central service managing the system with:
- **users**: Map<userId, User>
- **tweets**: Tweet[]

### Key Operations

#### 1. Follow User
```
Time Complexity: O(1)
Space Complexity: O(1)

Process:
1. Validate both users exist
2. Add follower to followee's followers set
3. Add followee to follower's following set
```

#### 2. Post Tweet
```
Time Complexity: O(1)
Space Complexity: O(1)

Process:
1. Validate user exists
2. Create new Tweet with timestamp
3. Add to tweets array
```

#### 3. Get Wall
```
Time Complexity: O(T log T) where T = number of tweets from user + followees
Space Complexity: O(T)

Process:
1. Get list of users to include (self + all followees)
2. Filter all tweets by these users
3. Sort by timestamp (newest first)
4. Return sorted list
```

## Design Decisions

### 1. In-Memory Storage
- **Decision**: Store all data in memory (Maps, Sets, Arrays)
- **Rationale**: Simple implementation for MVP; easy to extend to persistent storage later
- **Trade-off**: Data lost on restart; not suitable for production

### 2. Bidirectional Follow Tracking
- **Decision**: Store both followers and following relationships
- **Rationale**: Enables O(1) follow operations and efficient wall queries
- **Trade-off**: Uses more memory but significantly faster queries

### 3. Central Service Pattern
- **Decision**: TwitterService manages all users and tweets
- **Rationale**: Single source of truth; easier to maintain consistency
- **Trade-off**: Could become bottleneck at scale; would need to distribute

### 4. Immutable Tweets
- **Decision**: Tweets cannot be edited after creation
- **Rationale**: Simplifies system; matches Twitter's original behavior
- **Extension Point**: Could add edit history if needed

### 5. Set for Relationships
- **Decision**: Use Set<string> for followers/following
- **Rationale**: O(1) lookups; prevents duplicates automatically
- **Benefit**: Clean API without explicit duplicate checks

## Scalability Considerations

### Current Limitations
1. **Memory**: All data in RAM - limited by server memory
2. **Single Server**: No horizontal scaling
3. **No Persistence**: Data lost on restart

### Future Improvements
1. **Database Layer**: Add PostgreSQL/MongoDB for persistence
2. **Caching**: Redis for frequently accessed walls
3. **Sharding**: Partition users across multiple servers
4. **Fan-out on Write**: Pre-compute walls when tweets posted
5. **Pagination**: Add limit/offset to wall queries

### Performance Characteristics
- **Follow**: O(1) - instant
- **Post Tweet**: O(1) - instant
- **Get Wall**: O(T log T) where T = relevant tweets
  - For user with 100 followees posting 1000 tweets: ~100K operations
  - Optimization: Add pagination, limit to last N days

## API Interface

```typescript
interface ITwitterService {
  // User Management
  createUser(username: string): User;
  getUser(userId: string): User | undefined;

  // Follow Operations
  followUser(followerId: string, followeeId: string): void;
  unfollowUser(followerId: string, followeeId: string): void;

  // Tweet Operations
  postTweet(userId: string, content: string): Tweet;

  // Feed Operations
  getWall(userId: string): Tweet[];
}
```

## Error Handling
- User not found: throw Error
- Invalid tweet content: throw Error
- Self-follow attempt: throw Error
- Follow already exists: no-op (idempotent)

## Testing Strategy
1. **Unit Tests**: Test individual methods
2. **Integration Tests**: Test complete user flows
3. **Edge Cases**: Empty feeds, self-follows, duplicate follows

## Example Usage Flow
```typescript
const service = new TwitterService();

// Create users
const alice = service.createUser('alice');
const bob = service.createUser('bob');

// Alice follows Bob
service.followUser(alice.id, bob.id);

// Both post tweets
service.postTweet(alice.id, 'Hello world!');
service.postTweet(bob.id, 'My first tweet!');

// Alice's wall shows both tweets (newest first)
const wall = service.getWall(alice.id);
```
