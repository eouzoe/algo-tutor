#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// ── exCRT ──────────────────────────────────────────────

ll mod(ll a, ll m) { return (a % m + m) % m; }

ll exgcd(ll a, ll b, ll &x, ll &y) {
  if (b == 0) { x = 1; y = 0; return a; }
  ll g = exgcd(b, a % b, y, x);
  y -= a / b * x;
  return g;
}

pair<ll, ll> excrt(vector<pair<ll,ll>> eqs) {
  ll x = eqs[0].first, m = eqs[0].second;
  for (int i = 1; i < (int)eqs.size(); i++) {
    ll a = eqs[i].first, mi = eqs[i].second;
    ll t, _;
    ll g = exgcd(m, mi, t, _);
    if ((a - x) % g) return {-1, -1};
    ll lcm = m / g * mi;
    x = mod(x + (a - x) / g * t % (mi / g) * m, lcm);
    m = lcm;
  }
  return {x, m};
}

// ── Lucas ──────────────────────────────────────────────

ll mod_pow(ll a, ll e, ll p) {
  ll r = 1;
  while (e) { if (e & 1) r = r * a % p; a = a * a % p; e >>= 1; }
  return r;
}

ll comb_mod(ll n, ll k, ll p) {
  if (k > n) return 0;
  ll num = 1, den = 1;
  for (ll i = 1; i <= k; i++) {
    num = num * (n - i + 1) % p;
    den = den * i % p;
  }
  return num * mod_pow(den, p - 2, p) % p;
}

ll lucas(ll n, ll k, ll p) {
  if (k == 0) return 1;
  return lucas(n / p, k / p, p) * comb_mod(n % p, k % p, p) % p;
}
