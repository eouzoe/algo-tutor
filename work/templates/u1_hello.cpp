#include <iostream>
#include <string>
using namespace std;

int main() {
  ios_base::sync_with_stdio(false);
  cin.tie(nullptr);

  string name;
  cout << "Enter name: ";
  cin >> name;
  cout << "Hello, " << name << "!" << endl;
}
