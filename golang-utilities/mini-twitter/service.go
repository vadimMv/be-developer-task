package minitwitter

import (
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"
)

// TwitterService is the main service for the Mini Twitter system
// Manages users, tweets, and social interactions
// All operations are thread-safe
type TwitterService struct {
	mu          sync.RWMutex
	users       map[string]*User
	tweets      []*Tweet
	nextUserID  int
	nextTweetID int
}

// NewTwitterService creates a new TwitterService instance
func NewTwitterService() *TwitterService {
	return &TwitterService{
		users:       make(map[string]*User),
		tweets:      make([]*Tweet, 0),
		nextUserID:  1,
		nextTweetID: 1,
	}
}

// CreateUser creates a new user and adds them to the service (thread-safe)
func (s *TwitterService) CreateUser(username string) (*User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if username == "" {
		return nil, errors.New("username cannot be empty")
	}

	userID := fmt.Sprintf("user_%d", s.nextUserID)
	s.nextUserID++

	user := NewUser(userID, username)
	s.users[userID] = user
	return user, nil
}

// GetUser retrieves a user by ID (thread-safe)
func (s *TwitterService) GetUser(userID string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.users[userID]
	if !exists {
		return nil, errors.New("user not found")
	}
	return user, nil
}

// GetUserByUsername retrieves a user by username (thread-safe)
func (s *TwitterService) GetUserByUsername(username string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, user := range s.users {
		if user.Username() == username {
			return user, nil
		}
	}
	return nil, errors.New("user not found")
}

// GetAllUsers returns all users (thread-safe)
func (s *TwitterService) GetAllUsers() []*User {
	s.mu.RLock()
	defer s.mu.RUnlock()

	users := make([]*User, 0, len(s.users))
	for _, user := range s.users {
		users = append(users, user)
	}
	return users
}

// PostTweet creates a new tweet from a user (thread-safe)
func (s *TwitterService) PostTweet(userID, content string) (*Tweet, error) {
	if content == "" {
		return nil, errors.New("tweet content cannot be empty")
	}

	s.mu.Lock()

	// Check if user exists
	_, exists := s.users[userID]
	if !exists {
		s.mu.Unlock()
		return nil, errors.New("user not found")
	}

	tweetID := fmt.Sprintf("tweet_%d", s.nextTweetID)
	s.nextTweetID++
	s.mu.Unlock()

	tweet := NewTweet(tweetID, userID, content, time.Now())

	s.mu.Lock()
	s.tweets = append(s.tweets, tweet)
	s.mu.Unlock()

	return tweet, nil
}

// FollowUser makes one user follow another (thread-safe)
func (s *TwitterService) FollowUser(followerID, followeeID string) error {
	if followerID == followeeID {
		return errors.New("user cannot follow themselves")
	}

	s.mu.RLock()
	follower, followerExists := s.users[followerID]
	followee, followeeExists := s.users[followeeID]
	s.mu.RUnlock()

	if !followerExists || !followeeExists {
		return errors.New("user not found")
	}

	// Lock users in consistent order to avoid deadlocks
	// Always lock the user with smaller ID first
	if followerID < followeeID {
		follower.Follow(followeeID)
		followee.AddFollower(followerID)
	} else {
		followee.AddFollower(followerID)
		follower.Follow(followeeID)
	}

	return nil
}

// GetWall retrieves the wall (feed) for a user, showing their tweets and tweets from users they follow
// Sorted by timestamp in descending order (newest first)
func (s *TwitterService) GetWall(userID string) ([]*Tweet, error) {
	s.mu.RLock()
	user, exists := s.users[userID]
	if !exists {
		s.mu.RUnlock()
		return nil, errors.New("user not found")
	}

	following := user.GetFollowing()

	// Collect wall tweets
	wallTweets := make([]*Tweet, 0)
	for _, tweet := range s.tweets {
		if tweet.UserID() == userID || following[tweet.UserID()] {
			wallTweets = append(wallTweets, tweet)
		}
	}
	s.mu.RUnlock()

	// Sort tweets by timestamp (newest first)
	sort.Slice(wallTweets, func(i, j int) bool {
		return wallTweets[i].Timestamp().After(wallTweets[j].Timestamp())
	})

	return wallTweets, nil
}

// GetUserCount returns the total number of users (thread-safe)
func (s *TwitterService) GetUserCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.users)
}

// GetTweetCount returns the total number of tweets (thread-safe)
func (s *TwitterService) GetTweetCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.tweets)
}

// GetAllTweets returns all tweets (thread-safe)
func (s *TwitterService) GetAllTweets() []*Tweet {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tweets := make([]*Tweet, len(s.tweets))
	copy(tweets, s.tweets)
	return tweets
}

// GetUserTweets returns all tweets from a specific user (thread-safe)
func (s *TwitterService) GetUserTweets(userID string) ([]*Tweet, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	_, exists := s.users[userID]
	if !exists {
		return nil, errors.New("user not found")
	}

	userTweets := make([]*Tweet, 0)
	for _, tweet := range s.tweets {
		if tweet.UserID() == userID {
			userTweets = append(userTweets, tweet)
		}
	}

	return userTweets, nil
}
