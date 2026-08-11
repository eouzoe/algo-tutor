# C++ Style Guide for Competitive Programming

## Philosophy

This style guide prioritizes:
1. **Extreme readability** - code should be self-documenting
2. **High debuggability** - easy to debug with gdb and static analysis
3. **Competition-first** - optimized for speed of writing and correctness
4. **Modern C++17** - leveraging the latest features for safety and clarity
5. **Linux/K&R philosophy** - minimal, clean, no clutter

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
| Variables | snake_case | `node_count`, `ans` |
| Functions | snake_case | `solve()`, `dfs()` |
| Types/Structs | PascalCase | `SegmentTree`, `Graph` |
| Constants | UPPER_CASE | `MAX_N`, `MOD`, `INF` |
| Macros | UPPER_case | `FOR`, `ALL` |
| Global vars | g_ prefix | `g_graph`, `g_visited` |
| Private members | trailing _ | `data_`, `size_` |
| Template params | T, U, V | `template <typename T>` |

### Variable Naming Philosophy
- **Simple loop variables**: `i`, `j`, `k`, `n`, `m`, `x`, `y`
- **Temporary in small scope**: single letters OK
- **Complex logic**: descriptive names required
- **Global/core structures**: extremely specific, complete naming

```cpp
// OK: simple loop
for (int i = 0; i < n; i++) {
    cin >> arr[i];
}

// OK: complex logic needs names
int node_count = 0;
int edge_count = 0;
int max_depth = 0;

// BAD: complex logic with single letters
int a = 0;  // what is 'a'?
int b = 0;  // unclear
```

## Types & Declarations

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

### Variable Declaration
```cpp
// All variables at function top, aligned
int solve(int n, int m)
{
    int              node_count = 0;
    int              edge_count = 0;
    long long        total_cost = 0;
    vector<int>      neighbors;
    vector<char>     visited(n, 0);

    // ... logic ...

    return node_count;
}
```

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

## Modern C++17 Features

### Structured Bindings
```cpp
auto [min_val, max_val] = minmax_element(v);
for (auto &[key, val] : dict) {
    process(key, val);
}
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

### std::array over C Arrays
```cpp
// Prefer std::array
array<int, MAX_N> arr;           // NOT: int arr[MAX_N];
array<array<int, 100>, 100> grid; // NOT: int grid[100][100];

// For dynamic size, use vector
vector<int> dyn(n);
```

### std::string_view for Zero-Copy
```cpp
// Use string_view instead of const char* or const string&
void process(string_view name)
{
    if (name == "start") { }
}
```

### CTAD (Class Template Argument Deduction)
```cpp
pair p{1, 2.5};        // NOT: pair<int, double> p{1, 2.5};
vector v = {1, 2, 3};  // NOT: vector<int> v = {1, 2, 3};
```

## Arrays & Memory

### 1D Array for Multi-Dimensional (Cache Optimization)
```cpp
// Simulate 2D array with 1D for cache performance
int grid[MAX_N * MAX_N];

// Access: grid[i * MAX_N + j] instead of grid[i][j]
auto idx = [&](int r, int c) { return r * MAX_N + c; };
grid[idx(r, c)] = value;
```

### No new/malloc - Static Allocation
```cpp
// Global static allocation
int arr[MAX_N];
Graph g[MAX_N];

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // ... solve ...
    return 0;
}
```

## Input/Output

### Fast I/O (Always Use)
```cpp
int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // ... your code ...
    return 0;
}
```

### Fast Read for Large Input
```cpp
// fread buffer for massive input
static char buf[1 << 20];
static size_t idx = 0, size = 0;

inline char next_char()
{
    if (idx >= size) {
        size = fread(buf, 1, sizeof(buf), stdin);
        idx = 0;
        if (size == 0) return EOF;
    }
    return buf[idx++];
}

int read_int()
{
    char c;
    do { c = next_char(); } while (c <= ' ');
    int x = 0;
    while (c > ' ') {
        x = x * 10 + (c - '0');
        c = next_char();
    }
    return x;
}
```

### Output
```cpp
// Use '\n', never endl
cout << answer << '\n';

// Space-separated output with trick
for (int i = 0; i < n; i++) {
    cout << arr[i] << " \n"[i == n - 1];
}
```

## Control Flow

### Always Use Braces
```cpp
// NEVER omit braces
if (x > 0)          // BAD
    do_something();

if (x > 0) {        // GOOD
    do_something();
}

// Single statement still requires braces
for (int i = 0; i < n; i++)  // BAD
    sum += arr[i];

for (int i = 0; i < n; i++) {  // GOOD
    sum += arr[i];
}
```

### Ternary Operator
```cpp
// Use for simple conditional values
int ans = (x > 0) ? x : -x;

// DON'T nest ternaries - use if/else instead
int z = (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);  // BAD
```

### Early Returns (Fail Fast)
```cpp
int solve(int n)
{
    if (n == 0) return 0;
    if (n == 1) return 1;
    if (n < 0) return -1;  // error case

    // ... main logic ...

    return result;
}
```

### Flattened goto for Error Handling
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

## Safety & Defensive Programming

### Assert Over Comments
```cpp
// Use assert instead of comments for invariants
assert(n > 0 && "n must be positive");
assert(idx >= 0 && idx < n && "index out of bounds");

// NOT: // n must be positive
```

### Explicit Overflow Prevention
```cpp
// Large number operations: explicit cast
i64 result = (i64)a * b;  // prevent int overflow
i64 sum = (i64)n * (n + 1) / 2;

// NOT: int result = a * b;  // may overflow
```

### No Implicit Conversions
```cpp
// Explicit conversions only
int x = static_cast<int>(d);
i64 y = static_cast<i64>(x);
double z = static_cast<double>(x);

// NOT: int x = d;  // implicit
```

### Defensive Comparisons
```cpp
// Compare same types only
if ((i64)a == b) { }  // NOT: if (a == b) where different types

// Explicit boolean checks
if (ptr == nullptr) { }  // NOT: if (!ptr) - ambiguous
if (count == 0) { }      // NOT: if (!count)
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
// FORBIDDEN: using namespace std;
using namespace std;

// FORBIDDEN: #define for types
#define int long long

// FORBIDDEN: global mutable arrays without prefix
int arr[MAX_N];  // should be g_arr or inside solve()

// FORBIDDEN: std::endl (slow)
cout << x << endl;

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
using i64 = long long;

constexpr int MAX_N = 200'000;
constexpr int MOD = 1'000'000'007;

int g_n, m;
vector<int> g_graph[MAX_N];
char g_visited[MAX_N];

void dfs(int u, int depth, int &max_depth)
{
    g_visited[u] = 1;
    max_depth = max(max_depth, depth);

    for (int v : g_graph[u]) {
        if (g_visited[v]) continue;
        dfs(v, depth + 1, max_depth);
    }
}

int solve()
{
    cin >> g_n >> m;

    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g_graph[u].push_back(v);
        g_graph[v].push_back(u);
    }

    int result = 0;
    for (int i = 1; i <= g_n; i++) {
        if (!g_visited[i]) {
            int depth = 0;
            dfs(i, 1, depth);
            result = max(result, depth);
        }
    }

    return result;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int answer = solve();
    cout << answer << '\n';

    return 0;
}
```
