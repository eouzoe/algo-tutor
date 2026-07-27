#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const ll MOD = 998244353;

ll mod_pow(ll a, ll e) {
  ll r = 1;
  while (e) {
    if (e & 1) r = r * a % MOD;
    a = a * a % MOD;
    e >>= 1;
  }
  return r;
}

// ── Berlekamp-Massey ───────────────────────────────────

vector<ll> berlekamp_massey(vector<ll> const &seq) {
  vector<ll> C = {1}, B = {1};
  ll L = 0, m = 1, b = 1;

  for (ll i = 0; i < (ll)seq.size(); i++) {
    ll d = seq[i];
    for (ll j = 1; j <= L; j++)
      d = (d + C[j] * seq[i - j]) % MOD;

    if (d == 0) {
      m++;
    } else {
      vector<ll> T = C;
      ll factor = d * mod_pow(b, MOD - 2) % MOD;
      if (C.size() < B.size() + m) C.resize(B.size() + m);
      for (ll j = 0; j < (ll)B.size(); j++)
        C[j + m] = (C[j + m] - factor * B[j] % MOD + MOD) % MOD;

      if (2 * L <= i) {
        L = i + 1 - L;
        B = T;
        b = d;
        m = 1;
      } else {
        m++;
      }
    }
  }

  C.erase(C.begin());
  return C;
}
