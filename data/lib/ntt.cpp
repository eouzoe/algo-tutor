#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const ll MOD = 998244353;
const ll ROOT = 3;

ll mod_pow(ll a, ll e) {
  ll r = 1;
  while (e) {
    if (e & 1) r = r * a % MOD;
    a = a * a % MOD;
    e >>= 1;
  }
  return r;
}

void ntt(vector<ll> &a, bool invert) {
  ll n = a.size();
  for (ll i = 1, j = 0; i < n; i++) {
    ll bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) swap(a[i], a[j]);
  }

  for (ll len = 2; len <= n; len <<= 1) {
    ll wlen = mod_pow(ROOT, (MOD - 1) / len);
    for (ll i = 0; i < n; i += len) {
      ll w = 1;
      for (ll j = 0; j < len / 2; j++) {
        ll u = a[i + j];
        ll v = a[i + j + len / 2] * w % MOD;
        a[i + j] = (u + v) % MOD;
        a[i + j + len / 2] = (u - v + MOD) % MOD;
        w = w * wlen % MOD;
      }
    }
  }

  if (invert) {
    ll inv_n = mod_pow(n, MOD - 2);
    for (ll &x : a) x = x * inv_n % MOD;
    reverse(a.begin(), a.end());
  }
}

vector<ll> multiply(vector<ll> const &a, vector<ll> const &b) {
  ll n = 1;
  while (n < (ll)a.size() + (ll)b.size() - 1) n <<= 1;
  vector<ll> fa(n), fb(n);
  copy(a.begin(), a.end(), fa.begin());
  copy(b.begin(), b.end(), fb.begin());
  ntt(fa, false); ntt(fb, false);
  for (ll i = 0; i < n; i++) fa[i] = fa[i] * fb[i] % MOD;
  ntt(fa, true);
  fa.resize(a.size() + b.size() - 1);
  return fa;
}
