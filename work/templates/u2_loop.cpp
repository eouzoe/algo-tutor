#include <iostream>
using namespace std;

int main() {
  // for 迴圈範例
  for (int i = 0; i < 5; i++) {
    cout << i << ' ';
  }
  cout << endl;

  // 巢狀 for 畫矩形
  int h, w;
  cin >> h >> w;
  for (int r = 0; r < h; r++) {
    for (int c = 0; c < w; c++) {
      cout << '*';
    }
    cout << endl;
  }
}
