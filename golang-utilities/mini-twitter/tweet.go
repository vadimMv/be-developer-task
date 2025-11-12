package minitwitter

import (
	"fmt"
	"time"
)

// Tweet represents a tweet in the Mini Twitter system
// Immutable struct, no need for locks
type Tweet struct {
	id        string
	userID    string
	content   string
	timestamp time.Time
}

// NewTweet creates a new Tweet instance
func NewTweet(id, userID, content string, timestamp time.Time) *Tweet {
	return &Tweet{
		id:        id,
		userID:    userID,
		content:   content,
		timestamp: timestamp,
	}
}

// ID returns the tweet's ID
func (t *Tweet) ID() string {
	return t.id
}

// UserID returns the user ID who created the tweet
func (t *Tweet) UserID() string {
	return t.userID
}

// Content returns the tweet's content
func (t *Tweet) Content() string {
	return t.content
}

// Timestamp returns the tweet's creation timestamp
func (t *Tweet) Timestamp() time.Time {
	return t.timestamp
}

// String returns a string representation of the tweet
func (t *Tweet) String() string {
	return fmt.Sprintf("Tweet(id=%s, userID=%s, content=%s, timestamp=%s)",
		t.id, t.userID, t.content, t.timestamp.Format(time.RFC3339))
}

// GetAge returns the age of the tweet in milliseconds
func (t *Tweet) GetAge() int64 {
	return time.Since(t.timestamp).Milliseconds()
}

// CompareTo compares this tweet to another based on timestamp
// Returns negative if this tweet is older, positive if newer, 0 if same
func (t *Tweet) CompareTo(other *Tweet) int64 {
	return t.timestamp.UnixMilli() - other.timestamp.UnixMilli()
}
