set shell := ["nu", "-c"]
set quiet := true

_algo := "use .nu/algo.nu *; algo"

check-env:
    {{_algo}} doctor

today:
    {{_algo}} today

learn *args:
    {{_algo}} learn {{args}}

pass *args:
    {{_algo}} pass {{args}}

pick *args:
    {{_algo}} pick {{args}}

start problem *args:
    {{_algo}} start {{problem}} {{args}}

status:
    {{_algo}} status

hint *args:
    {{_algo}} hint {{args}}

code:
    {{_algo}} code

debug:
    {{_algo}} debug

finish result *args:
    {{_algo}} finish {{result}} {{args}}

abort:
    {{_algo}} abort

due:
    {{_algo}} due

done id *args:
    {{_algo}} done {{id}} {{args}}

rec *args:
    {{_algo}} rec {{args}}

stats *args:
    {{_algo}} stats {{args}}

report *args:
    {{_algo}} report {{args}}

diagnose *args:
    {{_algo}} diagnose {{args}}

anki *args:
    {{_algo}} anki {{args}}

doctor:
    {{_algo}} doctor

run *args:
    {{_algo}} run {{args}}

concept *args:
    {{_algo}} concept {{args}}

setup:
    cd mcp; ^bun install; cd ..; {{_algo}} sync; {{_algo}} doctor

sync:
    {{_algo}} sync

profile *args:
    {{_algo}} profile {{args}}

gen constraints *args:
    {{_algo}} gen "{{constraints}}" {{args}}

stress sol brute *args:
    {{_algo}} stress {{sol}} {{brute}} {{args}}

mcp:
    bun run mcp/index.ts

mcp-http port:
    bun run mcp/index.ts http {{port}}

mcp-check:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"server/discover\",\"params\":{}}" | bun run mcp/index.ts 2>/dev/null | python3 scripts/mcp_info.py'
    echo '---'
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/list\",\"params\":{}}" | bun run mcp/index.ts 2>/dev/null | python3 scripts/mcp_info.py'

training:
    just mcp-check

training-tools:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\",\"params\":{}}" | bun run mcp/index.ts 2>/dev/null | python3 scripts/mcp_info.py --training

diagnostic:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"diagnostic_status\",\"arguments\":{}}}" | bun run mcp/index.ts 2>/dev/null | python3 -c "import sys,json; lines=sys.stdin.readlines(); [print(json.loads(l)[\"result\"][\"content\"][0][\"text\"]) for l in reversed(lines) if l.strip().startswith(\"{\")]"'

diagnostic-problem n:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"diagnostic_problem\",\"arguments\":{\"index\":{{n}}}}}" | bun run mcp/index.ts 2>/dev/null | python3 -c "import sys,json; lines=sys.stdin.readlines(); [print(json.loads(l)[\"result\"][\"content\"][0][\"text\"]) for l in reversed(lines) if l.strip().startswith(\"{\")]"'

diagnostic-check problem_id:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"diagnostic_check\",\"arguments\":{\"problem_id\":\"{{problem_id}}\"}}}" | bun run mcp/index.ts 2>/dev/null | python3 -c "import sys,json; lines=sys.stdin.readlines(); [print(json.loads(l)[\"result\"][\"content\"][0][\"text\"]) for l in reversed(lines) if l.strip().startswith(\"{\")]"'

engine:test:
    cd packages/engine && bun test

mcp:check:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"server/discover\",\"params\":{}}" | timeout 5 bun run mcp/index.ts 2>/dev/null | grep -q "algo-tutor" && echo "MCP OK" || echo "MCP FAIL"
