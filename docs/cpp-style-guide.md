# C++ Style Guide for Competitive Programming

## Philosophy

This style guide prioritizes:
1. **Extreme readability** - code should be self-documenting
2. **High debuggability** - easy to debug with gdb and static analysis
3. **Competition-first** - optimized for speed of writing and correctness
4. **Modern C++17** - leveraging the latest features for safety and clarity
5. **Cache-friendly** - prefer flat arrays over nested vectors for performance

## Formatting

### Indentation
- **4 spaces** per indentation level (no tabs)
- Tab key must be configured to emit 4 spaces
- Never mix tabs and spaces

### Braces (K&R Style)
```cpp
// Control structures: opening brace on same line, space before
if (condition) {
    do_something();
} else {
    do_other();
}

for (int i = 0; i < n; i++) {
    process(i);
}

while (condition) {
    iterate();
}

// Functions: opening brace on new line at column 0
int solve(int n, int m)
{
    return n + m;
}

// Types: opening brace on same line
struct Point {
    int x;
    int y;
};
```

### Line Length
- Maximum 100 characters per line
- Break long lines at logical points

### Spacing
```cpp
// Control flow: space between keyword and parenthesis
if (x) { }      // NOT: if(x) { }
for ( ; ; ) { } // NOT: for(;;) { }
while (x) { }   // NOT: while(x) { }

// Binary operators: spaces on both sides
int result = a + b;
bool check = x > y && z < w;

// Unary operators: no space
count++;
flag = !ready;

// Function call: no space between name and parenthesis
print_answer(result);  // NOT: print_answer (result)
arr[i];               // NOT: arr [i]

// Comma: space after, not before
foo(a, b, c);  // NOT: foo(a,b,c)
```

## Naming

### Rules
| Element | Convention | Example |
|---------|-----------|---------|
| Variables | snake_case | `node_count`, `max_depth` |
| Functions | snake_case | `solve()`, `dfs()` |
| Types/Structs | PascalCase | `SegmentTree`, `Graph` |
| Constants | UPPER_CASE | `MAX_N`, `MOD`, `INF` |
| Macros | UPPER_case | `FOR`, `ALL` |
| Global vars | g_ prefix | `g_graph`, `g_visited` |
| Private members | trailing _ | `data_`, `size_` |
| Template params | T, U, V | `template <typename T>` |

### Variable Naming Philosophy
- **Simple loop variables**: `i`, `j`, `k`, `n`, `m`, `x`, `y`
- **Temporary in small scope**: single letters OK for simple cases
- **Complex logic**: descriptive names required
- **Global/core structures**: extremely specific, complete naming

```cpp
// OK: simple loop
for (int i = 0; i < n; i++) {
    cin >> arr[i];
}

// OK: complex logic needs names
int node_count = 0;
int max_depth = 0;
int current_component_size = 0;

// BAD: complex logic with single letters
int a = 0;  // what is 'a'?
int b = 0;  // unclear
```

## Types & Declarations

### Type Aliases
```cpp
// Use 'using', never 'typedef' or '#define'
using i64 = long long;
using pii = pair<int, int>;
using vi = vector<int>;

// NOT: #define int long long
// NOT: typedef long long i64;
```

### Constants
```cpp
// Use constexpr for compile-time constants
constexpr int MAX_N = 200'000;
constexpr int MOD = 1'000'000'007;
constexpr long long INF = 4e18;

// NOT: #define MAX_N 200000
// NOT: const int MAX_N = 200000;
```

### Variable Declaration
```cpp
// Variables declared when needed, not all at top
int n;
cin >> n;

vector<int> numbers(n);
for (int i = 0; i < n; i++) {
    cin >> numbers[i];
}
```

### Pointer Declaration
```cpp
// Star attaches to variable name, not type
int *ptr = nullptr;     // NOT: int* ptr
const char *str = "";   // NOT: const char* str

// Multiple declarations: one per line
int *p = nullptr;
int *q = nullptr;
// NOT: int *p, *q;
```

## Modern C++17 Features

### Using namespace
```cpp
// OK in competitive programming (short code, no conflicts)
using namespace std;

// Bring in specific names
using std::cin;
using std::cout;
```

### Auto and Type Deduction
```cpp
// Use auto to reduce typing
auto numbers = vector<int>(n);
auto [min_val, max_val] = minmax_element(numbers.begin(), numbers.end());

// Iterator with auto
auto it = lower_bound(numbers.begin(), numbers.end(), x);
```

### Structured Bindings
```cpp
// Clear unpacking of pairs/tuples
for (const auto &[key, value] : distance_map) {
    cout << key << ": " << value << '\n';
}

auto [a, b] = solve();
```

### if/switch with Initializer
```cpp
if (auto it = map.find(key); it != map.end()) {
    use(it->second);
}

switch (auto type = get_type(x); type) {
    case Type::A: handle_a(); break;
    case Type::B: handle_b(); break;
}
```

### CTAD (Class Template Argument Deduction)
```pair p{1, 2.5};        // NOT: pair<int, double> p{1, 2.5};
array arr = {1, 2, 3};  // NOT: array<int, 3> arr = {1, 2, 3};
```

## Arrays & Memory

### Prefer Flat Arrays for Cache Locality
```cpp
// GOOD: flat array, cache-friendly
constexpr int MAX_N = 200'000;
constexpr int MAX_M = 400'000;

int head[MAX_N], to[MAX_M], nxt[MAX_M], edge_cnt;

void init_graph(int node_count)
{
    fill(head, head + node_count, -1);
    edge_cnt = 0;
}

void add_edge(int from, int to_node)
{
    to[edge_cnt] = to_node;
    nxt[edge_cnt] = head[from];
    head[from] = edge_cnt++;
}

// Traverse neighbors of node u
for (int i = head[u]; i != -1; i = nxt[i]) {
    int v = to[i];
    // process neighbor v
}
```

### When to Use vector
```cpp
// OK for small graphs or when size unknown
vector<vector<int>> graph(n);

// BETTER for known max size: static array of vectors
vector<pair<int, int>> graph[MAX_N];

// BEST for performance: flat arrays (see above)
```

### Why Cache Locality Matters
```cpp
// BAD: vector of vectors (pointer chasing, cache misses)
vector<vector<pair<int, int>>> graph(n);
// Each inner vector allocates separately on heap
// Traversal causes cache misses

// GOOD: static array of vectors (better)
vector<pair<int, int>> graph[MAX_N];
// Array is contiguous, vectors are small

// BEST: flat arrays (no allocations, fully contiguous)
// See example above
```

## Bit Manipulation

### Basic Operations
```cpp
// Check odd/even
if (x & 1) { /* odd */ }

// Set bit
x |= (1 << k);

// Clear bit
x &= ~(1 << k);

// Toggle bit
x ^= (1 << k);

// Check bit
if (x & (1 << k)) { /* bit k is set */ }

// Lowest set bit
int lowbit = x & (-x);

// Remove lowest set bit
x &= (x - 1);

// Power of two check
bool is_power_of_two = (x & (x - 1)) == 0;
```

### Compiler Builtins
```cpp
// Count set bits
int bits = __builtin_popcount(x);      // 32-bit
int bits = __builtin_popcountll(x);    // 64-bit

// Count trailing zeros
int tz = __builtin_ctz(x);

// Count leading zeros
int lz = __builtin_clz(x);
```

### Subset Enumeration
```cpp
// Enumerate all subsets of set of size n
for (int mask = 0; mask < (1 << n); mask++) {
    // process subset
}

// Enumerate subsets of a mask
for (int sub = mask; sub; sub = (sub - 1) & mask) {
    // process sub-mask
}
```

## Input/Output

### Fast I/O (Always Use)
```cpp
int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // ...
}
```

### Output
```cpp
// Use '\n', never endl
cout << answer << '\n';

// Space-separated output trick
for (int i = 0; i < n; i++) {
    cout << arr[i] << " \n"[i == n - 1];
}
```

## Control Flow

### Always Use Braces
```cpp
// NEVER omit braces
if (x)          // BAD
    do_something();

if (x) {        // GOOD
    do_something();
}

// Single statement still requires braces
for (int i = 0; i < n; i++)  // BAD
    sum += arr[i];

for (int i = 0; i < n; i++) {  // GOOD
    sum += arr[i];
}
```

### Early Returns (Fail Fast)
```cpp
int solve(int n)
{
    if (n == 0) return 0;
    if (n == 1) return 1;

    // ... main logic ...

    return result;
}
```

### Goto for Error Handling
```cpp
int process()
{
    if (!init()) goto cleanup;
    if (!load()) goto cleanup;
    if (!compute()) goto cleanup;

    return result;

cleanup:
    release_resources();
    return -1;
}
```

## Functions

### Single Responsibility
```cpp
// Each function does one thing
int compute_depth(int node, const vector<vector<int>> &graph)
{
    // ... compute depth only ...
    return depth;
}

void dfs(int u, int depth, const vector<vector<int>> &graph)
{
    // ... traverse only ...
}
```

### Pass by Reference
```cpp
// Large objects: const reference
void process(const vector<int> &data, const Graph &g)
{
    // read-only access
}

// Modifiable: reference
void modify(vector<int> &data)
{
    data[0] = 42;
}
```

### Return Multiple Values
```cpp
// Use structured bindings with pair/tuple
pair<int, int> find_min_max(const vector<int> &v)
{
    auto [min_it, max_it] = minmax_element(v.begin(), v.end());
    return {*min_it, *max_it};
}

auto [mn, mx] = find_min_max(arr);
```

## Comments

### Philosophy: Code Explains Itself
- Minimize comments
- Only comment non-obvious logic or invariants
- Use English only, academic style
- Comments should explain WHY, not WHAT

```cpp
// GOOD: explains why
// Halve the search space since target is in left half
hi = mid;

// BAD: repeats what code does
// Set hi to mid
hi = mid;

// GOOD: invariant check
assert(heap.size() <= n && "heap overflow");

// BAD: unnecessary
// Increment i
i++;
```

## Anti-Patterns (FORBIDDEN)

```cpp
// FORBIDDEN: using namespace std; + custom vector type
// (conflicts with std::vector)

// FORBIDDEN: std::endl (slow)
cout << x << endl;

// FORBIDDEN: vector<bool> (bitset specialization, slower)
vector<bool> v(n);

// FORBIDDEN: implicit conversions
int x = 3.14;

// FORBIDDEN: no braces
if (x) do_stuff();

// FORBIDDEN: compressed lines
if (x) { do_stuff(); do_more(); }

// FORBIDDEN: ternary abuse
int z = (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);
```

## Complete Example

```cpp
#include <bits/stdc++.h>
using namespace std;
using i64 = long long;
using pii = pair<int, int>;

constexpr int MAX_N = 200'000;
constexpr int MAX_M = 400'000;

int node_count = 0;
int edge_count = 0;
int head[MAX_N], to[MAX_M], nxt[MAX_M], weight[MAX_M];
char visited[MAX_N];

void init_graph(int n)
{
    fill(head, head + n, -1);
    edge_count = 0;
}

void add_edge(int from, int to_node, int w)
{
    to[edge_count] = to_node;
    weight[edge_count] = w;
    nxt[edge_count] = head[from];
    head[from] = edge_count++;
}

void dfs(int current_node, int current_depth, int &max_depth)
{
    assert(current_node >= 0 && current_node < node_count);
    visited[current_node] = 1;
    max_depth = max(max_depth, current_depth);

    for (int i = head[current_node]; i != -1; i = nxt[i]) {
        int neighbor = to[i];
        int w = weight[i];
        if (visited[neighbor]) {
            continue;
        }
        dfs(neighbor, current_depth + 1, max_depth);
    }
}

i64 solve()
{
    int n, m;
    cin >> n >> m;

    init_graph(n);
    node_count = n;

    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        add_edge(u, v, w);
        add_edge(v, u, w);
    }

    int max_depth = 0;
    dfs(0, 1, max_depth);

    return max_depth;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cout << solve() << '\n';

    return 0;
}
```

## Performance Guide

### When to Use What

| Scenario | Use | Why |
|----------|-----|-----|
| Small graph (n < 1000) | `vector<vector<int>>` | Simple, readable |
| Medium graph (n < 50000) | `vector<pii> g[MAXN]` | Balance of speed and simplicity |
| Large graph (n > 50000) | Flat arrays | Maximum performance |
| Unknown size | `vector<vector<int>>` | Flexibility |

### Optimization Progression
1. Start with `vector<vector<int>>` for clarity
2. If TLE: switch to `vector<pii> g[MAXN]`
3. If still TLE: switch to flat arrays (forward star)
```
