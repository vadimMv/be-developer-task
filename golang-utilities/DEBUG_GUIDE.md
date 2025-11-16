# Debugging Go Files in VS Code - Complete Guide

This guide explains how to debug your golang-utilities project using breakpoints in Visual Studio Code.

## Prerequisites

### 1. Install Go Extension for VS Code

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for "Go" (by Go Team at Google)
4. Click **Install**

### 2. Install Delve Debugger

Delve is the Go debugger that VS Code uses. Install it by running:

```bash
go install github.com/go-delve/delve/cmd/dlv@latest
```

Verify installation:
```bash
dlv version
```

## Quick Start: Debug with Breakpoints

### Method 1: Debug Current File (Fastest)

1. **Open any Go file** (e.g., `golang-utilities/rate-limiter/token_bucket.go`)
2. **Set breakpoints** by clicking in the left margin (red dot appears)
3. **Press F5** or click the green play button in the Debug panel
4. **Select** "Go: Debug Current File" from the dropdown

### Method 2: Debug Specific Examples

1. **Open Debug Panel**: Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
2. **Select configuration** from dropdown:
   - `Go: Debug Promise Example`
   - `Go: Debug Mini Twitter Example`
   - `Go: Debug Generic Utils Example`
   - `Go: Debug Rate Limiter Example`
3. **Set breakpoints** in the files you want to debug
4. **Press F5** to start debugging

## Setting Breakpoints

### Regular Breakpoint
- **Click** on the left margin (line number area)
- A **red dot** appears
- Code will pause when this line is reached

### Conditional Breakpoint
1. **Right-click** in the left margin
2. Select **"Add Conditional Breakpoint"**
3. Enter condition (e.g., `i == 5` or `len(requests) > 10`)
4. Code pauses only when condition is true

### Logpoint (Print without stopping)
1. **Right-click** in the left margin
2. Select **"Add Logpoint"**
3. Enter message (e.g., `Value is {myVariable}`)
4. Prints to Debug Console without stopping execution

## Debugging Controls

Once debugging starts, use these controls:

| Action | Shortcut | Description |
|--------|----------|-------------|
| **Continue** | `F5` | Resume execution until next breakpoint |
| **Step Over** | `F10` | Execute current line, don't enter functions |
| **Step Into** | `F11` | Enter function calls to debug inside |
| **Step Out** | `Shift+F11` | Exit current function |
| **Restart** | `Ctrl+Shift+F5` | Restart debugging session |
| **Stop** | `Shift+F5` | Stop debugging |

## Debug Panels

### 1. Variables Panel
- Shows all variables in current scope
- Expand objects to see fields
- Hover to see values
- Right-click to copy or modify values

### 2. Watch Panel
- Add expressions to monitor (e.g., `len(tb.requests)`)
- Updates automatically as you step through code
- Right-click to add/remove expressions

### 3. Call Stack
- Shows function call hierarchy
- Click to jump to different stack frames
- Useful for understanding how you got to current point

### 4. Debug Console
- Execute Go expressions while paused
- Example: type `tb.tokens` to see value
- Use for quick variable inspection

## Practical Examples for golang-utilities

### Example 1: Debug Token Bucket Rate Limiter

1. Open `golang-utilities/rate-limiter/token_bucket.go`
2. Set breakpoints at:
   - Line with `func (tb *TokenBucket) Allow() bool` (function entry)
   - Line with `tb.refill()` (to see token refill)
   - Line with `if tb.tokens >= float64(n)` (to check condition)

3. Open `golang-utilities/examples/ratelimiter_example.go`
4. Set breakpoint in `tokenBucketExample()` function

5. Select **"Go: Debug Rate Limiter Example"** from debug dropdown
6. Press **F5**

**What to watch:**
- **Variables Panel**: `tb.tokens`, `tb.capacity`, `tb.refillRate`
- **Watch**: Add `tb.tokens` to see how it changes
- **Step through** with F10 to see token consumption

### Example 2: Debug Sliding Window Counter

1. Open `golang-utilities/rate-limiter/sliding_window_counter.go`
2. Set breakpoints at:
   - `calculateEstimatedCount()` function
   - Line with formula: `estimatedCount := ...`
   - `updateWindows()` function

3. Open example file and add breakpoint in `slidingWindowCounterExample()`

4. Debug and observe:
   - **Watch**: `swc.prevCount`, `swc.currCount`
   - **Watch**: `prevWindowWeight` calculation
   - **Step Into** (F11) `calculateEstimatedCount()` to see math

### Example 3: Debug Promise Implementation

1. Open `golang-utilities/promise/promise.go`
2. Set breakpoints at:
   - `func New[T any](...)`
   - Inside the goroutine
   - `Then()`, `Catch()` methods

3. Open `golang-utilities/examples/promise_example.go`
4. Set breakpoint where promise is created

5. Select **"Go: Debug Promise Example"**
6. Press **F5**

**Observe goroutine behavior:**
- Variables show channel states
- Step through to see async execution
- Watch panel shows promise state changes

## Advanced Debugging Tips

### 1. Debug with Arguments

Edit `.vscode/launch.json` to add command-line arguments:

```json
{
  "name": "Go: Debug with Args",
  "type": "go",
  "request": "launch",
  "mode": "debug",
  "program": "${workspaceFolder}/golang-utilities/examples/ratelimiter_example.go",
  "args": ["--verbose", "--rate=100"],
  "cwd": "${workspaceFolder}"
}
```

### 2. Debug Tests

To debug Go tests:

```json
{
  "name": "Go: Debug Test",
  "type": "go",
  "request": "launch",
  "mode": "test",
  "program": "${workspaceFolder}/golang-utilities/rate-limiter",
  "args": ["-test.run", "TestTokenBucket"]
}
```

Then run test with:
```bash
go test -v ./golang-utilities/rate-limiter/...
```

### 3. Attach to Running Process

For already-running processes:

```json
{
  "name": "Go: Attach to Process",
  "type": "go",
  "request": "attach",
  "mode": "local",
  "processId": "${command:pickProcess}"
}
```

### 4. Remote Debugging

Debug code running in Docker or remote machine:

```json
{
  "name": "Go: Remote Debug",
  "type": "go",
  "request": "attach",
  "mode": "remote",
  "remotePath": "${workspaceFolder}",
  "port": 2345,
  "host": "localhost"
}
```

## Common Scenarios for Rate Limiters

### Scenario 1: Debug Why Request Was Denied

**Problem**: Want to see why `Allow()` returned false

**Steps**:
1. Set breakpoint at `if tb.tokens >= float64(n)`
2. Check **Variables** for `tb.tokens` value
3. Check `n` parameter
4. Step into `refill()` to see if tokens should have been added

### Scenario 2: Understand Sliding Window Math

**Problem**: Confused about weighted calculation

**Steps**:
1. Open `sliding_window_counter.go`
2. Set breakpoint in `calculateEstimatedCount()`
3. Add to **Watch**:
   - `elapsed`
   - `prevWindowWeight`
   - `float64(swc.prevCount) * prevWindowWeight`
   - `float64(swc.currCount)`
4. Step through and watch values change

### Scenario 3: Debug Race Conditions

**Problem**: Concurrent access issues

**Steps**:
1. Add `"dlvFlags": ["--check-go-version=false"]` to launch.json
2. Run with race detector:
```bash
go run -race examples/ratelimiter_example.go
```
3. Set breakpoints at mutex locks/unlocks
4. Observe when goroutines are waiting

### Scenario 4: Trace Request Flow

**Problem**: Want to see complete flow of a request

**Steps**:
1. Set breakpoint at example function (e.g., `tokenBucketExample()`)
2. Step Into (F11) `limiter.Allow()`
3. Continue Step Into through:
   - `Allow()` → `AllowN()` → `refill()`
4. Use **Call Stack** to see full path

## Keyboard Shortcuts Summary

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Start Debugging | `F5` | `F5` |
| Toggle Breakpoint | `F9` | `F9` |
| Step Over | `F10` | `F10` |
| Step Into | `F11` | `F11` |
| Step Out | `Shift+F11` | `Shift+F11` |
| Continue | `F5` | `F5` |
| Stop | `Shift+F5` | `Shift+F5` |
| Debug Console | `Ctrl+Shift+Y` | `Cmd+Shift+Y` |
| Debug Panel | `Ctrl+Shift+D` | `Cmd+Shift+D` |

## Troubleshooting

### Problem: "dlv" command not found

**Solution**:
```bash
go install github.com/go-delve/delve/cmd/dlv@latest
```

Add to PATH if needed:
```bash
export PATH=$PATH:$(go env GOPATH)/bin
```

### Problem: Breakpoints not hitting

**Causes & Solutions**:
1. **Code not reached**: Add log statement to verify
2. **Optimizations**: Disable with `-gcflags="all=-N -l"`
3. **Wrong file**: Check you're debugging correct configuration

### Problem: Cannot see variable values

**Causes**:
1. **Optimized out**: Variable optimized away by compiler
2. **Out of scope**: Variable not available at current line
3. **Goroutine**: Switch to correct goroutine in Call Stack

### Problem: Debug session too slow

**Solutions**:
1. Use fewer breakpoints
2. Use conditional breakpoints instead of stepping
3. Use logpoints instead of breakpoints for inspection
4. Disable "showLog" in launch.json

## Best Practices

1. **Start Simple**: Begin with one breakpoint at function entry
2. **Use Watch Panel**: Add important variables you want to track
3. **Step Over (F10)** for most code, **Step Into (F11)** when investigating
4. **Use Debug Console** for quick variable inspection
5. **Conditional Breakpoints** save time (e.g., `i > 100`)
6. **Name Configurations** clearly in launch.json
7. **Clean Up**: Remove breakpoints when done debugging

## Rate Limiter Specific Tips

### Token Bucket
- Watch: `tokens`, `refillRate`, `lastRefill`
- Breakpoint: `refill()` function
- Step through refill logic to see token addition

### Leaky Bucket
- Watch: `queue`, `leakRate`, `lastLeak`
- Breakpoint: `leak()` function
- Observe queue draining

### Fixed Window
- Watch: `counter`, `windowStart`
- Breakpoint: `resetWindowIfNeeded()`
- See window boundary transitions

### Sliding Window Log
- Watch: `len(swl.requests)`, `swl.requests[0]`
- Breakpoint: `removeExpiredRequests()`
- Watch old requests being cleaned

### Sliding Window Counter
- Watch: `prevCount`, `currCount`, `estimatedCount`
- Breakpoint: `calculateEstimatedCount()`
- Understand weighted calculation

## Additional Resources

- [Go Debugging Guide](https://github.com/golang/vscode-go/wiki/debugging)
- [Delve Documentation](https://github.com/go-delve/delve/tree/master/Documentation)
- [VS Code Go Extension](https://marketplace.visualstudio.com/items?itemName=golang.go)

---

**Quick Reference**: Open any `.go` file, click left margin to add breakpoint (red dot), press F5, select "Go: Debug Current File", done!
