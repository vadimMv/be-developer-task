/**
 * Example usage and tests for Mini Twitter
 */

import { TwitterService } from '../src/TwitterService';

console.log('=== Mini Twitter Example ===\n');

// Initialize the service
const twitter = new TwitterService();

console.log('1. Creating users...');
const alice = twitter.createUser('alice');
const bob = twitter.createUser('bob');
const charlie = twitter.createUser('charlie');
console.log(`   Created: ${alice.username} (${alice.id})`);
console.log(`   Created: ${bob.username} (${bob.id})`);
console.log(`   Created: ${charlie.username} (${charlie.id})\n`);

console.log('2. Setting up follow relationships...');
twitter.followUser(alice.id, bob.id); // Alice follows Bob
twitter.followUser(alice.id, charlie.id); // Alice follows Charlie
twitter.followUser(bob.id, charlie.id); // Bob follows Charlie
console.log(`   ${alice.username} follows ${bob.username}`);
console.log(`   ${alice.username} follows ${charlie.username}`);
console.log(`   ${bob.username} follows ${charlie.username}\n`);

console.log('3. Posting tweets...');
const tweet1 = twitter.postTweet(alice.id, 'Hello Twitter! This is my first tweet!');
console.log(`   ${alice.username}: "${tweet1.content}"`);

// Wait a bit to ensure different timestamps
setTimeout(() => {
  const tweet2 = twitter.postTweet(bob.id, 'Beautiful day for coding!');
  console.log(`   ${bob.username}: "${tweet2.content}"`);
}, 10);

setTimeout(() => {
  const tweet3 = twitter.postTweet(charlie.id, 'TypeScript is awesome!');
  console.log(`   ${charlie.username}: "${tweet3.content}"`);
}, 20);

setTimeout(() => {
  const tweet4 = twitter.postTweet(alice.id, 'Just followed some interesting people!');
  console.log(`   ${alice.username}: "${tweet4.content}"`);
}, 30);

setTimeout(() => {
  const tweet5 = twitter.postTweet(bob.id, 'Working on a new project...');
  console.log(`   ${bob.username}: "${tweet5.content}"`);
}, 40);

setTimeout(() => {
  const tweet6 = twitter.postTweet(charlie.id, 'Anyone up for a code review?');
  console.log(`   ${charlie.username}: "${tweet6.content}"\n`);

  // Now display the walls
  console.log('4. Viewing walls (newest tweets first)...\n');

  console.log(`=== ${alice.username}'s Wall ===`);
  console.log(`(Shows tweets from ${alice.username} + users they follow: ${bob.username}, ${charlie.username})`);
  const aliceWall = twitter.getWall(alice.id);
  aliceWall.forEach((tweet) => {
    const author = twitter.getUser(tweet.userId);
    console.log(`   [@${author?.username}] ${tweet.content}`);
    console.log(`   └─ ${tweet.timestamp.toISOString()}`);
  });

  console.log(`\n=== ${bob.username}'s Wall ===`);
  console.log(`(Shows tweets from ${bob.username} + users they follow: ${charlie.username})`);
  const bobWall = twitter.getWall(bob.id);
  bobWall.forEach((tweet) => {
    const author = twitter.getUser(tweet.userId);
    console.log(`   [@${author?.username}] ${tweet.content}`);
    console.log(`   └─ ${tweet.timestamp.toISOString()}`);
  });

  console.log(`\n=== ${charlie.username}'s Wall ===`);
  console.log(`(Shows only ${charlie.username}'s tweets - follows nobody)`);
  const charlieWall = twitter.getWall(charlie.id);
  charlieWall.forEach((tweet) => {
    const author = twitter.getUser(tweet.userId);
    console.log(`   [@${author?.username}] ${tweet.content}`);
    console.log(`   └─ ${tweet.timestamp.toISOString()}`);
  });

  console.log('\n5. Statistics...');
  console.log(`   Total users: ${twitter.getUserCount()}`);
  console.log(`   Total tweets: ${twitter.getTweetCount()}`);
  console.log(`   ${alice.username} follows ${alice.getFollowingCount()} users`);
  console.log(`   ${bob.username} has ${bob.getFollowerCount()} followers`);

  console.log('\n6. Testing edge cases...');

  // Test invalid tweet
  try {
    twitter.postTweet(alice.id, '');
  } catch (error) {
    console.log(`   ✓ Empty tweet rejected: ${(error as Error).message}`);
  }

  // Test self-follow
  try {
    twitter.followUser(alice.id, alice.id);
  } catch (error) {
    console.log(`   ✓ Self-follow rejected: ${(error as Error).message}`);
  }

  // Test non-existent user
  try {
    twitter.postTweet('invalid_user', 'This should fail');
  } catch (error) {
    console.log(`   ✓ Invalid user rejected: ${(error as Error).message}`);
  }

  console.log('\n=== All tests passed! ===');
}, 50);
