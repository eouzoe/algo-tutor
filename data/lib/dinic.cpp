#include <bits/stdc++.h>
using namespace std;

struct Dinic {
  struct Edge { int to, rev; ll cap; };
  vector<vector<Edge>> g;
  vector<int> level, it;
  Dinic(int n) : g(n), level(n), it(n) {}

  void add_edge(int from, int to, ll cap) {
    g[from].push_back({to, (int)g[to].size(), cap});
    g[to].push_back({from, (int)g[from].size() - 1, 0});
  }

  bool bfs(int s, int t) {
    fill(level.begin(), level.end(), -1);
    queue<int> q({s}); level[s] = 0;
    while (!q.empty()) {
      int v = q.front(); q.pop();
      for (auto &e : g[v]) {
        if (e.cap > 0 && level[e.to] < 0) {
          level[e.to] = level[v] + 1;
          q.push(e.to);
        }
      }
    }
    return level[t] >= 0;
  }

  ll dfs(int v, int t, ll f) {
    if (v == t) return f;
    for (int &i = it[v]; i < (int)g[v].size(); i++) {
      Edge &e = g[v][i];
      if (e.cap > 0 && level[v] < level[e.to]) {
        ll d = dfs(e.to, t, min(f, e.cap));
        if (d > 0) {
          e.cap -= d;
          g[e.to][e.rev].cap += d;
          return d;
        }
      }
    }
    return 0;
  }

  ll max_flow(int s, int t) {
    ll flow = 0;
    while (bfs(s, t)) {
      fill(it.begin(), it.end(), 0);
      while (ll f = dfs(s, t, LLONG_MAX)) flow += f;
    }
    return flow;
  }
};
