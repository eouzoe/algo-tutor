#include <iostream>
using namespace std;

int add(int a, int b) {
  return a + b;
}

int fact(int n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}

int main() {
  int x, y;
  cin >> x >> y;
  cout << add(x, y) << endl;
  cout << fact(x) << endl;
}
