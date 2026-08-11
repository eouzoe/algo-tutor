#!/usr/bin/env python3
"""
algo-tutor CLI — Python replacement for .nu/algo.nu
Handles: run, fmt, diagnostic, session management
"""

import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path


def root() -> Path:
    """Get project root directory."""
    env_root = os.environ.get("ALGO_ROOT")
    if env_root:
        return Path(env_root)
    cwd = Path.cwd()
    if (cwd / ".nu" / "algo.nu").exists() or (cwd / "mcp" / "server.ts").exists():
        return cwd
    return Path.home() / "src" / "active" / "algo-tutor"


def attempts_file() -> Path:
    return root() / "log" / "attempts.jsonl"


def rec_file() -> Path:
    return root() / "log" / "recognition.jsonl"


def session_file() -> Path:
    return root() / "log" / "session.json"


def load_jsonl(path: Path) -> list:
    """Load JSONL file."""
    if not path.exists():
        return []
    with open(path) as f:
        return [json.loads(line) for line in f if line.strip()]


def append_jsonl(path: Path, row: dict):
    """Append JSON line to file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def load_session() -> dict | None:
    """Load current session."""
    sf = session_file()
    if not sf.exists():
        return None
    with open(sf) as f:
        return json.load(f)


def save_session(s: dict):
    """Save session."""
    sf = session_file()
    sf.parent.mkdir(parents=True, exist_ok=True)
    with open(sf, "w") as f:
        json.dump(s, f, ensure_ascii=False, indent=2)


def remove_session():
    """Remove session file."""
    sf = session_file()
    if sf.exists():
        sf.unlink()


def ask(prompt: str) -> str:
    """Ask user for input."""
    return input(f"{prompt}: ").strip()


def ask_int(prompt: str) -> int:
    """Ask user for integer input."""
    s = ask(prompt)
    return int(s) if s else 0


def cmd_run(args: list[str]):
    """Compile and run code."""
    file = args[0] if args else "work/sol.cpp"
    input_file = "work/in.txt"

    # Compile
    compile_cmd = [
        "g++", "-O2", "-std=c++17", "-Wall", "-Wextra",
        "-o", "/tmp/algo_run", file
    ]
    result = subprocess.run(compile_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("=== COMPILE ERROR ===")
        print(result.stderr)
        return

    # Run
    run_cmd = ["/tmp/algo_run"]
    if Path(input_file).exists():
        with open(input_file) as f:
            result = subprocess.run(run_cmd, stdin=f, capture_output=True, text=True)
    else:
        result = subprocess.run(run_cmd, capture_output=True, text=True)

    print(result.stdout, end="")
    if result.stderr:
        print("=== STDERR ===")
        print(result.stderr)


def cmd_fmt(args: list[str]):
    """Format code with astyle."""
    file = args[0] if args else "work/sol.cpp"
    subprocess.run([
        "astyle",
        "--style=stroustrup",
        "--indent=spaces=4",
        "--max-code-length=100",
        "--break-closing-braces",
        "--break-elseifs",
        "--add-braces",
        "--align-pointer=name",
        "--pad-oper",
        "--pad-header",
        "--convert-tabs",
        file
    ])


def cmd_diagnostic(args: list[str]):
    """Syntax diagnostic."""
    idx = int(args[0]) if args else 0
    # Load diagnostic problems
    diag_file = root() / "data" / "training" / "seeds" / "ioi-syntax-diagnostic.json"
    with open(diag_file) as f:
        problems = json.load(f)["problems"]

    if idx >= len(problems):
        print("No more problems.")
        return

    p = problems[idx]
    print(f"\n=== Problem {idx + 1}/{len(problems)} ===")
    print(f"ID: {p['id']}")
    print(f"Statement: {p['statement']}")
    print(f"Constraints: {p.get('constraints', {})}")
    print(f"\nWrite your solution in work/sol.cpp")
    print(f"Run: python3 cli.py diagnostic-check {p['id']}")


def cmd_diagnostic_check(args: list[str]):
    """Check diagnostic solution."""
    problem_id = args[0] if args else ""
    diag_file = root() / "data" / "training" / "seeds" / "ioi-syntax-diagnostic.json"
    with open(diag_file) as f:
        problems = json.load(f)["problems"]

    problem = next((p for p in problems if p["id"] == problem_id), None)
    if not problem:
        print(f"Problem {problem_id} not found.")
        return

    # Compile
    compile_cmd = [
        "g++", "-O2", "-std=c++17",
        "-o", "/tmp/diag", "work/sol.cpp"
    ]
    result = subprocess.run(compile_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("=== COMPILE ERROR ===")
        print(result.stderr)
        return False

    # Run test cases
    all_passed = True
    for tc in problem.get("test_cases", []):
        result = subprocess.run(
            ["/tmp/diag"],
            input=tc["input"],
            capture_output=True,
            text=True
        )
        output = result.stdout.strip()
        expected = tc["expected"].strip()
        passed = output == expected
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] Input: {tc['input'][:30]}... Expected: {expected[:30]}... Got: {output[:30]}...")
        if not passed:
            all_passed = False

    if all_passed:
        print("All tests passed!")
    else:
        print("Some tests failed. Fix your code and try again.")

    return all_passed


def cmd_start(args: list[str]):
    """Start a problem session."""
    problem = args[0] if args else ""
    if not problem:
        print("Usage: start <problem_id>")
        return

    session = load_session()
    if session:
        print(f"Session already in progress: {session.get('problem')}")
        print("Finish with: finish <result>")
        print("Abort with: abort")
        return

    topics = ask("Topics (comma-separated)")
    phase = ask("Phase [learn/practice/exam] (default: practice)")
    stuck_min = ask_int("Stuck minutes before L1 hint (default: 30)")

    new_session = {
        "problem": problem,
        "rating": None,
        "topics": [t.strip().lower() for t in topics.split(",") if t.strip()],
        "mode": "solve",
        "session_phase": phase or "practice",
        "stuck_min": stuck_min or 30,
        "started": datetime.now().isoformat(),
        "phase": "think",
        "events": [{"at": datetime.now().isoformat(), "kind": "start"}],
        "hints": [],
        "denied": 0,
        "active_file": "work/sol.cpp"
    }
    save_session(new_session)
    print(f"Started {problem}. L1 hint in {stuck_min or 30} minutes.")


def cmd_status(args: list[str]):
    """Show session status."""
    session = load_session()
    if not session:
        print("No session in progress.")
        return

    print(f"Problem: {session.get('problem')}")
    print(f"Phase: {session.get('session_phase')}")
    print(f"Status: {session.get('phase')}")
    started = datetime.fromisoformat(session.get("started", ""))
    elapsed = (datetime.now() - started).total_seconds() / 60
    print(f"Elapsed: {elapsed:.0f} minutes")
    print(f"Hints used: {len(session.get('hints', []))}")
    print(f"Denied: {session.get('denied', 0)}")


def cmd_hint(args: list[str]):
    """Request hint."""
    session = load_session()
    if not session:
        print("No session in progress.")
        return

    hints = session.get("hints", [])
    level = len(hints) + 1
    if level > 4:
        print("All hint levels used.")
        return

    # Calculate when hint is unlocked
    started = datetime.fromisoformat(session.get("started", ""))
    elapsed = (datetime.now() - started).total_seconds() / 60
    unlock_time = (level - 1) * 15 + session.get("stuck_min", 30)

    if elapsed < unlock_time:
        remaining = unlock_time - elapsed
        print(f"Hint L{level} locked. {remaining:.0f} minutes remaining.")
        session["denied"] = session.get("denied", 0) + 1
        save_session(session)
        return

    notes = ask("Your current thoughts / where you're stuck")
    hint = {
        "level": level,
        "at": datetime.now().isoformat(),
        "notes": notes
    }
    hints.append(hint)
    session["hints"] = hints
    save_session(session)

    # Return hint based on level
    hints_text = [
        "Think about the simplest case. What's the brute force approach?",
        "Consider what data structure could help organize the information.",
        "Look for patterns in the input. Can you sort or group elements?",
        "The key insight is: {problem_specific_hint}"
    ]
    print(f"=== L{level} Hint ===")
    if level <= len(hints_text):
        print(hints_text[level - 1])


def cmd_finish(args: list[str]):
    """Finish session and record attempt."""
    result = args[0] if args else ""
    if not result:
        print("Usage: finish <ac/partial/fail> [--err <code>] [--summary <text>] [--cue <text>]")
        return

    session = load_session()
    if not session:
        print("No session in progress.")
        return

    started = datetime.fromisoformat(session.get("started", ""))
    code_events = [e for e in session.get("events", []) if e.get("kind") == "code"]
    debug_events = [e for e in session.get("events", []) if e.get("kind") == "debug"]

    code_at = datetime.fromisoformat(code_events[0]["at"]) if code_events else started
    debug_at = datetime.fromisoformat(debug_events[0]["at"]) if debug_events else None

    t_thint = int((code_at - started).total_seconds() / 60)
    t_code = int(((debug_at or datetime.now()) - code_at).total_seconds() / 60)
    t_debug = int(((datetime.now() - debug_at).total_seconds() / 60) if debug_at else 0)

    err = ask("Error classification [R/K/P/M/I/B/E/T] (or empty for clean AC)")
    summary = ask("Feynman summary (≤3 sentences)")
    cue = ask("Cue card: next time I see __ I will __")

    hint_level = len(session.get("hints", []))
    final_result = "ac_hint" if result == "ac" and hint_level > 0 else result

    row = {
        "kind": "attempt",
        "id": datetime.now().strftime("%Y%m%d%H%M%S"),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "problem": session.get("problem"),
        "rating": session.get("rating"),
        "topics": session.get("topics", []),
        "mode": session.get("mode", "solve"),
        "result": final_result,
        "score": None,
        "hint_level": hint_level,
        "t_think": t_thint,
        "t_code": t_code,
        "t_debug": t_debug,
        "error_primary": err.upper() if err else None,
        "error_secondary": None,
        "summary": summary,
        "cue": cue,
        "needs_review": result != "ac" or hint_level > 0 or err in ["K", "P", "M"],
        "hints": session.get("hints", []),
        "hint_denied": session.get("denied", 0)
    }

    append_jsonl(attempts_file(), row)
    remove_session()
    print(f"Recorded {row['id']} ({session.get('problem')}): think {t_thint}m / code {t_code}m / debug {t_debug}m / hint L{hint_level}")


def cmd_abort(args: list[str]):
    """Abort session without recording."""
    session = load_session()
    if not session:
        print("No session in progress.")
        return
    remove_session()
    print(f"Aborted {session.get('problem')}")


def cmd_log(args: list[str]):
    """Show recent logs."""
    limit = int(args[0]) if args else 20
    attempts = load_jsonl(attempts_file())
    for a in attempts[-limit:]:
        print(f"{a['date']} {a['problem']}: {a['result']} (think {a.get('t_think', 0)}m)")


def cmd_stats(args: list[str]):
    """Show statistics."""
    days = int(args[0]) if args else 30
    attempts = load_jsonl(attempts_file())
    total = len(attempts)
    ac = len([a for a in attempts if a["result"] == "ac"])
    ac_hint = len([a for a in attempts if a["result"] == "ac_hint"])
    partial = len([a for a in attempts if a["result"] == "partial"])
    fail = len([a for a in attempts if a["result"] == "fail"])

    print(f"=== Last {days} days ===")
    print(f"Total attempts: {total}")
    print(f"AC: {ac} ({100*ac//total if total else 0}%)")
    print(f"AC with hints: {ac_hint}")
    print(f"Partial: {partial}")
    print(f"Fail: {fail}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 cli.py <command> [args]")
        print("Commands: run, fmt, diagnostic, diagnostic-check, start, status, hint, finish, abort, log, stats")
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    commands = {
        "run": cmd_run,
        "fmt": cmd_fmt,
        "diagnostic": cmd_diagnostic,
        "diagnostic-check": cmd_diagnostic_check,
        "start": cmd_start,
        "status": cmd_status,
        "hint": cmd_hint,
        "finish": cmd_finish,
        "abort": cmd_abort,
        "log": cmd_log,
        "stats": cmd_stats,
    }

    fn = commands.get(cmd)
    if not fn:
        print(f"Unknown command: {cmd}")
        sys.exit(1)

    fn(args)


if __name__ == "__main__":
    main()
