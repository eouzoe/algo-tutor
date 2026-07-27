#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// ── Deque CHT (斜率單調, 查詢 x 單調) ─────────────────

struct Line {
  ll m, b;
  ll val(ll x) const { return m * x + b; }
};

struct DequeCHT {
  deque<Line> dq;

  bool bad(const Line &l1, const Line &l2, const Line &l3) {
    return (__int128)(l3.b - l1.b) * (l1.m - l2.m)
         <= (__int128)(l2.b - l1.b) * (l1.m - l3.m);
  }

  void add(ll m, ll b) {
    Line l = {m, b};
    while (dq.size() >= 2 && bad(dq[dq.size()-2], dq.back(), l))
      dq.pop_back();
    dq.push_back(l);
  }

  ll query(ll x) {
    while (dq.size() >= 2 && dq[0].val(x) >= dq[1].val(x))
      dq.pop_front();
    return dq[0].val(x);
  }
};

// ── Li Chao 線段樹 (任意斜率) ────────────────────────

struct LiChao {
  struct Line { ll m, b; };
  vector<Line> tree;
  int n;

  LiChao(int sz) {
    n = 1;
    while (n < sz) n <<= 1;
    tree.assign(n * 2, {0, LLONG_MAX});
  }

  void add_line(ll m, ll b, int idx, int l, int r) {
    int mid = (l + r) / 2;
    bool left = m * l + b < tree[idx].m * l + tree[idx].b;
    bool midc = m * mid + b < tree[idx].m * mid + tree[idx].b;

    if (midc) swap(tree[idx].m, m), swap(tree[idx].b, b);
    if (l == r) return;

    if (left != midc)
      add_line(m, b, idx * 2, l, mid);
    else
      add_line(m, b, idx * 2 + 1, mid + 1, r);
  }

  void add_line(ll m, ll b) { add_line(m, b, 1, 0, n - 1); }

  ll query(ll x, int idx, int l, int r) {
    ll res = tree[idx].m * x + tree[idx].b;
    if (l == r) return res;
    int mid = (l + r) / 2;
    if (x <= mid)
      return min(res, query(x, idx * 2, l, mid));
    else
      return min(res, query(x, idx * 2 + 1, mid + 1, r));
  }

  ll query(ll x) { return query(x, 1, 0, n - 1); }
};
