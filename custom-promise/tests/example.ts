import { CustomPromise } from '../src/CustomPromise';

/**
 * Test Suite for CustomPromise
 * Demonstrates the functionality of our custom Promise implementation
 */

console.log('🧪 Starting CustomPromise Tests...\n');

// Test 1: Basic resolve
console.log('Test 1: Basic resolve');
new CustomPromise<string>((resolve) => {
  resolve('Success!');
}).then(value => {
  console.log('✓ Resolved with:', value);
  console.log('');
});

// Test 2: Basic reject
console.log('Test 2: Basic reject');
new CustomPromise<string>((_, reject) => {
  reject('Error!');
}).catch(error => {
  console.log('✓ Caught error:', error);
  console.log('');
});

// Test 3: Chaining
console.log('Test 3: Promise chaining');
new CustomPromise<number>((resolve) => {
  resolve(5);
})
  .then(value => {
    console.log('  Step 1:', value);
    return value * 2;
  })
  .then(value => {
    console.log('  Step 2:', value);
    return value + 10;
  })
  .then(value => {
    console.log('✓ Final value:', value);
    console.log('');
  });

// Test 4: Async resolve
console.log('Test 4: Async resolve');
new CustomPromise<string>((resolve) => {
  setTimeout(() => {
    resolve('Async success!');
  }, 100);
}).then(value => {
  console.log('✓ Async resolved with:', value);
  console.log('');
});

// Test 5: Error handling in chain
console.log('Test 5: Error handling in chain');
new CustomPromise<number>((resolve) => {
  resolve(10);
})
  .then(value => {
    console.log('  Initial value:', value);
    throw new Error('Something went wrong!');
  })
  .catch(error => {
    console.log('✓ Error caught:', error.message);
    return 'Recovered';
  })
  .then(value => {
    console.log('✓ Continued after recovery:', value);
    console.log('');
  });

// Test 6: CustomPromise.resolve
console.log('Test 6: CustomPromise.resolve');
CustomPromise.resolve(42).then(value => {
  console.log('✓ Static resolve:', value);
  console.log('');
});

// Test 7: CustomPromise.reject
console.log('Test 7: CustomPromise.reject');
CustomPromise.reject('Static error').catch(error => {
  console.log('✓ Static reject:', error);
  console.log('');
});

// Test 8: CustomPromise.all
console.log('Test 8: CustomPromise.all');
CustomPromise.all([
  CustomPromise.resolve(1),
  CustomPromise.resolve(2),
  CustomPromise.resolve(3)
]).then(values => {
  console.log('✓ All resolved:', values);
  console.log('');
});

// Test 9: CustomPromise.all with rejection
console.log('Test 9: CustomPromise.all with rejection');
CustomPromise.all([
  CustomPromise.resolve(1),
  CustomPromise.reject('Failed!'),
  CustomPromise.resolve(3)
]).catch(error => {
  console.log('✓ All rejected due to:', error);
  console.log('');
});

// Test 10: CustomPromise.race
console.log('Test 10: CustomPromise.race');
CustomPromise.race([
  new CustomPromise<string>((resolve) => setTimeout(() => resolve('Slow'), 200)),
  new CustomPromise<string>((resolve) => setTimeout(() => resolve('Fast'), 50)),
  new CustomPromise<string>((resolve) => setTimeout(() => resolve('Medium'), 100))
]).then(value => {
  console.log('✓ Race winner:', value);
  console.log('');
});

// Test 11: CustomPromise.allSettled
console.log('Test 11: CustomPromise.allSettled');
CustomPromise.allSettled([
  CustomPromise.resolve(1),
  CustomPromise.reject('Error 1'),
  CustomPromise.resolve(3),
  CustomPromise.reject('Error 2')
]).then(results => {
  console.log('✓ All settled:', JSON.stringify(results, null, 2));
  console.log('');
});

// Test 12: CustomPromise.any
console.log('Test 12: CustomPromise.any');
CustomPromise.any([
  CustomPromise.reject('Error 1'),
  CustomPromise.resolve('Success!'),
  CustomPromise.reject('Error 2')
]).then(value => {
  console.log('✓ Any resolved with:', value);
  console.log('');
});

// Test 13: CustomPromise.any with all rejections
console.log('Test 13: CustomPromise.any with all rejections');
CustomPromise.any([
  CustomPromise.reject('Error 1'),
  CustomPromise.reject('Error 2'),
  CustomPromise.reject('Error 3')
]).catch(error => {
  console.log('✓ All rejected:', error.message);
  console.log('');
});

// Test 14: Finally
console.log('Test 14: Finally');
new CustomPromise<string>((resolve) => {
  resolve('Done');
})
  .then(value => {
    console.log('  Value:', value);
    return value;
  })
  .finally(() => {
    console.log('✓ Finally called (success case)');
  })
  .then(() => {
    return CustomPromise.reject('Error');
  })
  .finally(() => {
    console.log('✓ Finally called (error case)');
  })
  .catch(error => {
    console.log('  Error handled:', error);
    console.log('');
  });

// Test 15: Thenable resolution
console.log('Test 15: Thenable resolution');
new CustomPromise<number>((resolve) => {
  resolve(
    new CustomPromise<number>((innerResolve) => {
      setTimeout(() => innerResolve(99), 50);
    }) as any
  );
}).then(value => {
  console.log('✓ Thenable resolved with:', value);
  console.log('');
});

// Test 16: Complex chaining scenario
console.log('Test 16: Complex chaining scenario');
CustomPromise.resolve(1)
  .then(x => {
    console.log('  Start:', x);
    return x + 1;
  })
  .then(x => {
    console.log('  Step 1:', x);
    return CustomPromise.resolve(x * 2);
  })
  .then(x => {
    console.log('  Step 2:', x);
    return x + 10;
  })
  .then(x => {
    console.log('  Step 3:', x);
    if (x > 10) throw new Error('Too large!');
    return x;
  })
  .catch(error => {
    console.log('  Caught:', error.message);
    return 0;
  })
  .then(x => {
    console.log('✓ Final result:', x);
    console.log('');
  });

// Allow time for all async operations to complete
setTimeout(() => {
  console.log('✅ All tests completed!');
}, 500);
