#!/usr/bin/env python3
"""Parse MCP JSON from stdin and print summary."""
import json
import sys

content = sys.stdin.read()

# Find the last valid JSON object
lines = content.strip().split("\n")
data = None
for line in reversed(lines):
    line = line.strip()
    if line.startswith("{"):
        try:
            data = json.loads(line)
            break
        except json.JSONDecodeError:
            continue

if data is None:
    print("Error: No valid JSON found", file=sys.stderr)
    sys.exit(1)

result = data.get("result", {})

if "tools" in result:
    tools = result["tools"]
    print(f"Tools: {len(tools)}")
    if "--training" in sys.argv:
        training = [t for t in tools if "training" in t["name"]]
        for t in training:
            desc = t["description"].split("\n")[0][:60]
            print(f"  {t['name']:30} {desc}")
elif "protocolVersions" in result:
    print(f"Protocol: {result['protocolVersions']}")
    print(f"Server: {result.get('serverInfo', {}).get('name', '?')}")
else:
    print(f"Response keys: {list(result.keys())}")
