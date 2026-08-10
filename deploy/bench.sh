#!/bin/bash
FILE="$1"
INPUT_FILE="work/in.txt"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

echo "=== COMPILE ==="
g++ -O2 -std=c++17 -Wall -Wextra -o /tmp/a "$FILE" 2>&1
if [ $? -ne 0 ]; then exit 1; fi
echo "OK"

INPUT=""
if [ -f "$INPUT_FILE" ]; then
    INPUT="$(head -c 500 "$INPUT_FILE")"
fi

echo ""
echo "=== ALGO BENCH ==="
nu -c "use .nu/algo.nu *; algo bench '$FILE' -i '$(echo "$INPUT" | sed "s/'/'\\\\''/g")' -t 3" 2>&1

echo ""
echo "=== TIME -V ==="
if [ -n "$INPUT" ]; then
    echo "$INPUT" | /usr/bin/time -v /tmp/a 2>&1
else
    /usr/bin/time -v /tmp/a 2>&1
fi
