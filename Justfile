_default:
    @just --list

today:
    @python3 cli.py status

learn *args:
    @python3 cli.py learn {{args}}

pass *args:
    @python3 cli.py pass {{args}}

pick *args:
    @python3 cli.py pick {{args}}

start problem *args:
    @python3 cli.py start {{problem}} {{args}}

status:
    @python3 cli.py status

hint *args:
    @python3 cli.py hint {{args}}

code:
    @python3 cli.py code

debug:
    @python3 cli.py debug

finish result *args:
    @python3 cli.py finish {{result}} {{args}}

abort:
    @python3 cli.py abort

due:
    @python3 cli.py due

done id *args:
    @python3 cli.py done {{id}} {{args}}

rec *args:
    @python3 cli.py rec {{args}}

stats *args:
    @python3 cli.py stats {{args}}

report *args:
    @python3 cli.py report {{args}}

diagnose *args:
    @python3 cli.py diagnose {{args}}

anki *args:
    @python3 cli.py anki {{args}}

doctor:
    @python3 cli.py doctor

run *args:
    @python3 cli.py run {{args}}

concept *args:
    @python3 cli.py concept {{args}}

fmt:
    @python3 cli.py fmt

setup:
    cd mcp && bun install && cd .. && python3 cli.py sync && python3 cli.py doctor

sync:
    @python3 cli.py sync

profile *args:
    @python3 cli.py profile {{args}}

gen constraints *args:
    @python3 cli.py gen "{{constraints}}" {{args}}

stress sol brute *args:
    @python3 cli.py stress {{sol}} {{brute}} {{args}}

workspace:
    ^bash deploy/workspace.sh
