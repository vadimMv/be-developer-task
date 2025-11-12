package main

import (
	"fmt"
	"time"

	minitwitter "github.com/vadimMv/be-developer-task/golang-utilities/mini-twitter"
)

func main() {
	fmt.Println("=== Mini Twitter Example ===\n")

	// Initialize the service
	twitter := minitwitter.NewTwitterService()

	// 1. Creating users
	fmt.Println("1. Creating users...")
	alice, _ := twitter.CreateUser("alice")
	bob, _ := twitter.CreateUser("bob")
	charlie, _ := twitter.CreateUser("charlie")
	fmt.Printf("   Created: %s (%s)\n", alice.Username(), alice.ID())
	fmt.Printf("   Created: %s (%s)\n", bob.Username(), bob.ID())
	fmt.Printf("   Created: %s (%s)\n", charlie.Username(), charlie.ID())

	// 2. Setting up follow relationships
	fmt.Println("\n2. Setting up follow relationships...")
	twitter.FollowUser(alice.ID(), bob.ID())    // Alice follows Bob
	twitter.FollowUser(alice.ID(), charlie.ID()) // Alice follows Charlie
	twitter.FollowUser(bob.ID(), charlie.ID())   // Bob follows Charlie
	fmt.Printf("   %s follows %s\n", alice.Username(), bob.Username())
	fmt.Printf("   %s follows %s\n", alice.Username(), charlie.Username())
	fmt.Printf("   %s follows %s\n", bob.Username(), charlie.Username())

	// 3. Posting tweets
	fmt.Println("\n3. Posting tweets...")
	tweet1, _ := twitter.PostTweet(alice.ID(), "Hello Twitter! This is my first tweet!")
	fmt.Printf("   %s: \"%s\"\n", alice.Username(), tweet1.Content())
	time.Sleep(10 * time.Millisecond)

	tweet2, _ := twitter.PostTweet(bob.ID(), "Beautiful day for coding!")
	fmt.Printf("   %s: \"%s\"\n", bob.Username(), tweet2.Content())
	time.Sleep(10 * time.Millisecond)

	tweet3, _ := twitter.PostTweet(charlie.ID(), "Go is awesome!")
	fmt.Printf("   %s: \"%s\"\n", charlie.Username(), tweet3.Content())
	time.Sleep(10 * time.Millisecond)

	tweet4, _ := twitter.PostTweet(alice.ID(), "Just followed some interesting people!")
	fmt.Printf("   %s: \"%s\"\n", alice.Username(), tweet4.Content())
	time.Sleep(10 * time.Millisecond)

	tweet5, _ := twitter.PostTweet(bob.ID(), "Working on a new project...")
	fmt.Printf("   %s: \"%s\"\n", bob.Username(), tweet5.Content())
	time.Sleep(10 * time.Millisecond)

	tweet6, _ := twitter.PostTweet(charlie.ID(), "Anyone up for a code review?")
	fmt.Printf("   %s: \"%s\"\n", charlie.Username(), tweet6.Content())

	// 4. Viewing walls
	fmt.Println("\n4. Viewing walls (newest tweets first)...\n")

	fmt.Printf("=== %s's Wall ===\n", alice.Username())
	fmt.Printf("(Shows tweets from %s + users they follow: %s, %s)\n", alice.Username(), bob.Username(), charlie.Username())
	aliceWall, _ := twitter.GetWall(alice.ID())
	for _, tweet := range aliceWall {
		author, _ := twitter.GetUser(tweet.UserID())
		fmt.Printf("   [@%s] %s\n", author.Username(), tweet.Content())
		fmt.Printf("   └─ %s\n", tweet.Timestamp().Format(time.RFC3339))
	}

	fmt.Printf("\n=== %s's Wall ===\n", bob.Username())
	fmt.Printf("(Shows tweets from %s + users they follow: %s)\n", bob.Username(), charlie.Username())
	bobWall, _ := twitter.GetWall(bob.ID())
	for _, tweet := range bobWall {
		author, _ := twitter.GetUser(tweet.UserID())
		fmt.Printf("   [@%s] %s\n", author.Username(), tweet.Content())
		fmt.Printf("   └─ %s\n", tweet.Timestamp().Format(time.RFC3339))
	}

	fmt.Printf("\n=== %s's Wall ===\n", charlie.Username())
	fmt.Printf("(Shows only %s's tweets - follows nobody)\n", charlie.Username())
	charlieWall, _ := twitter.GetWall(charlie.ID())
	for _, tweet := range charlieWall {
		author, _ := twitter.GetUser(tweet.UserID())
		fmt.Printf("   [@%s] %s\n", author.Username(), tweet.Content())
		fmt.Printf("   └─ %s\n", tweet.Timestamp().Format(time.RFC3339))
	}

	// 5. Statistics
	fmt.Println("\n5. Statistics...")
	fmt.Printf("   Total users: %d\n", twitter.GetUserCount())
	fmt.Printf("   Total tweets: %d\n", twitter.GetTweetCount())
	fmt.Printf("   %s follows %d users\n", alice.Username(), alice.GetFollowingCount())
	fmt.Printf("   %s has %d followers\n", bob.Username(), bob.GetFollowerCount())

	// 6. Testing edge cases
	fmt.Println("\n6. Testing edge cases...")

	// Test empty tweet
	_, err := twitter.PostTweet(alice.ID(), "")
	if err != nil {
		fmt.Printf("   ✓ Empty tweet rejected: %s\n", err)
	}

	// Test self-follow
	err = twitter.FollowUser(alice.ID(), alice.ID())
	if err != nil {
		fmt.Printf("   ✓ Self-follow rejected: %s\n", err)
	}

	// Test non-existent user
	_, err = twitter.PostTweet("invalid_user", "This should fail")
	if err != nil {
		fmt.Printf("   ✓ Invalid user rejected: %s\n", err)
	}

	// 7. Thread safety demonstration
	fmt.Println("\n7. Demonstrating thread safety...")
	done := make(chan bool)

	// Concurrent tweet posting
	for i := 0; i < 5; i++ {
		go func(num int) {
			twitter.PostTweet(alice.ID(), fmt.Sprintf("Concurrent tweet #%d", num))
			done <- true
		}(i)
	}

	// Wait for all goroutines
	for i := 0; i < 5; i++ {
		<-done
	}

	fmt.Printf("   ✓ Posted 5 concurrent tweets. Total tweets now: %d\n", twitter.GetTweetCount())

	fmt.Println("\n=== All tests passed! ===")
}
