#!/bin/bash
# forge bench wrapper — vim F8 呼叫用
# 編譯目前檔案 + 詳細時間/記憶體分析
FILE="$1"
INPUT_FILE="work/in.txt"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

# 編譯
echo "=== 編譯 ==="
g++ -O2 -std=c++17 -Wall -Wextra -o /tmp/a "$FILE" 2>&1
if [ $? -ne 0 ]; then exit 1; fi
echo "OK"

# 讀取測資
INPUT=""
if [ -f "$INPUT_FILE" ]; then
    INPUT="$(head -c 500 "$INPUT_FILE")"
fi

echo ""
echo "=== FORGE BENCH ==="
nu -c "use .nu/forge.nu *; forge bench '$FILE' -i '$(echo "$INPUT" | sed "s/'/'\\\\''/g")' -t 3" 2>&1

echo ""
echo "=== TIME -V（系統級詳細資源）==="
if [ -n "$INPUT" ]; then
    echo "$INPUT" | /usr/bin/time -v /tmp/a 2>&1
else
    /usr/bin/time -v /tmp/a 2>&1
fi
