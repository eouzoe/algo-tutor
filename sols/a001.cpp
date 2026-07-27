#include <iostream> 
#include <string>

using namespace std;

int main () {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    string s;
    cout << "請輸入文字" << flush;
    while (cin >> s) {
        cout << "hello, " << s << '\n';
    }  
    return 0;
}

