set shell := ["nu", "-c"]
set quiet := true

_algo := "use .nu/algo.nu *; algo"

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

workspace:
    ^bash deploy/workspace.sh
