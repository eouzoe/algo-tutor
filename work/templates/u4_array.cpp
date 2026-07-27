#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
  // 固定陣列
  int a[5] = {2, 4, 6, 8, 10};
  for (int i = 0; i < 5; i++) {
    cout << a[i] << ' ';
  }
  cout << endl;

  // vector 動態陣列
  vector<int> v;
  int n;
  cin >> n;
  for (int i = 0; i < n; i++) {
    int x;
    cin >> x;
    v.push_back(x);
  }
  for (int x : v) {
    cout << x << ' ';
  }
  cout << endl;

  // string 操作
  string s = "hello";
  s += " world";
  cout << s << endl;
  for (char c : s) {
    cout << c << '-';
  }
  cout << endl;
}
