#include <bits/stdc++.h>
using namespace std;

struct SAM {
  struct State {
    int len, link;
    map<char, int> next;
  };
  vector<State> st;
  int last;

  SAM() : st(1), last(0) { st[0] = {0, -1, {}}; }

  void extend(char c) {
    int p = last, cur = st.size();
    st.push_back({st[p].len + 1, 0, {}});
    last = cur;

    while (p >= 0 && !st[p].next.count(c)) {
      st[p].next[c] = cur;
      p = st[p].link;
    }

    if (p < 0) {
      st[cur].link = 0;
    } else {
      int q = st[p].next[c];
      if (st[p].len + 1 == st[q].len) {
        st[cur].link = q;
      } else {
        int clone = st.size();
        st.push_back({st[p].len + 1, st[q].link, st[q].next});
        while (p >= 0 && st[p].next[c] == q) {
          st[p].next[c] = clone;
          p = st[p].link;
        }
        st[q].link = clone;
        st[cur].link = clone;
      }
    }
  }

  void build(const string &s) {
    for (char c : s) extend(c);
  }

  long long distinct_substrings() {
    long long ans = 0;
    for (int i = 1; i < (int)st.size(); i++)
      ans += st[i].len - st[st[i].link].len;
    return ans;
  }
};
