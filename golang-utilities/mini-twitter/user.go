package minitwitter

import (
	"errors"
	"sync"
)

// User represents a user in the Mini Twitter system
// All operations are thread-safe
type User struct {
	mu        sync.RWMutex
	id        string
	username  string
	followers map[string]bool
	following map[string]bool
}

// NewUser creates a new User instance
func NewUser(id, username string) *User {
	return &User{
		id:        id,
		username:  username,
		followers: make(map[string]bool),
		following: make(map[string]bool),
	}
}

// ID returns the user's ID (thread-safe read)
func (u *User) ID() string {
	u.mu.RLock()
	defer u.mu.RUnlock()
	return u.id
}

// Username returns the user's username (thread-safe read)
func (u *User) Username() string {
	u.mu.RLock()
	defer u.mu.RUnlock()
	return u.username
}

// GetFollowerCount returns the number of followers (thread-safe)
func (u *User) GetFollowerCount() int {
	u.mu.RLock()
	defer u.mu.RUnlock()
	return len(u.followers)
}

// GetFollowingCount returns the number of users being followed (thread-safe)
func (u *User) GetFollowingCount() int {
	u.mu.RLock()
	defer u.mu.RUnlock()
	return len(u.following)
}

// GetFollowers returns a copy of the followers set (thread-safe)
func (u *User) GetFollowers() map[string]bool {
	u.mu.RLock()
	defer u.mu.RUnlock()

	followers := make(map[string]bool, len(u.followers))
	for id := range u.followers {
		followers[id] = true
	}
	return followers
}

// GetFollowing returns a copy of the following set (thread-safe)
func (u *User) GetFollowing() map[string]bool {
	u.mu.RLock()
	defer u.mu.RUnlock()

	following := make(map[string]bool, len(u.following))
	for id := range u.following {
		following[id] = true
	}
	return following
}

// AddFollower adds a follower to the user (thread-safe)
func (u *User) AddFollower(followerID string) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.followers[followerID] = true
}

// Follow makes this user follow another user (thread-safe)
func (u *User) Follow(userID string) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.following[userID] = true
}

// RemoveFollower removes a follower from the user (thread-safe)
func (u *User) RemoveFollower(followerID string) error {
	u.mu.Lock()
	defer u.mu.Unlock()

	if !u.followers[followerID] {
		return errors.New("follower not found")
	}

	delete(u.followers, followerID)
	return nil
}

// Unfollow makes this user unfollow another user (thread-safe)
func (u *User) Unfollow(userID string) error {
	u.mu.Lock()
	defer u.mu.Unlock()

	if !u.following[userID] {
		return errors.New("not following this user")
	}

	delete(u.following, userID)
	return nil
}

// IsFollowing checks if this user is following another user (thread-safe)
func (u *User) IsFollowing(userID string) bool {
	u.mu.RLock()
	defer u.mu.RUnlock()
	return u.following[userID]
}

// HasFollower checks if this user has a specific follower (thread-safe)
func (u *User) HasFollower(followerID string) bool {
	u.mu.RLock()
	defer u.mu.RUnlock()
	return u.followers[followerID]
}
