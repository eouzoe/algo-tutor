# algo-tutor

LLM-driven competitive programming tutor. Student codes in vim, LLM teaches via MCP.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/eouzoe/algo-tutor/main/start.sh | bash
cd ~/algo-tutor && devenv shell
```

Works on WSL Ubuntu and WSL NixOS.

## Usage

```bash
just mcp              # stdio mode (connect to Claude Code / Codex)
just mcp-http 3000    # HTTP mode (remote)
```

## How it works

1. Student opens `work/sol.cpp` in vim
2. `:vert term` opens terminal, starts AI tool (Claude Code / Codex)
3. LLM teaches via MCP tools: lessons, drills, problems, grading

## Architecture

```
mcp/              MCP server (50 tools, TypeScript/Bun)
packages/engine/   cognitive engine (BKT/IRT/FSRS/KST)
data/              curriculum, concept index, toolkit
start.sh           one-command bootstrap
```

## Requirements

None. `start.sh` auto-installs Nix, devenv, and all dependencies.
