# ioi-forge 訓練日誌工具
# use .nu/forge.nu *

const INTERVALS = [7 30 90]

def root [] {
  $env.FORGE_ROOT? | default ($env.HOME | path join "src/active/ioi-forge")
}

def attempts-file [] { root | path join "log/attempts.jsonl" }
def rec-file [] { root | path join "log/recognition.jsonl" }

def load [] {
  let f = (attempts-file)
  if ($f | path exists) {
    open --raw $f | lines | where ($it | str trim | is-not-empty) | each { $in | from json }
  } else { [] }
}

def append-line [file: string, row: record] {
  ($row | to json -r) + "\n" | save --append $file
}

def ask [prompt: string] { input $"($prompt): " | str trim }

def ask-int [prompt: string] {
  let s = (ask $prompt)
  if ($s | is-empty) { 0 } else { $s | into int }
}

# 互動式記錄一次解題
export def "forge add" [] {
  let now = (date now)
  let problem = (ask "題目 (cf/1850C, cses/1640, URL)")
  let rating_s = (ask "難度 rating (可空)")
  let topics = (ask "主題標籤 (逗號分隔)") | split row "," | each { str trim | str downcase } | where ($it | is-not-empty)
  let mode = (ask "模式 [solve/speed/virtual/contest/upsolve] (預設 solve)")
  let result = (ask "結果 [ac/ac_hint/partial/fail]")
  let score = if $result == "partial" { ask-int "分數 0-100" } else { null }
  let hint = (ask-int "提示等級 0-4")
  let t_think = (ask-int "思考分鐘")
  let t_code = (ask-int "實作分鐘")
  let t_debug = (ask-int "除錯分鐘")
  let err = (ask "主因分類 [R/K/P/M/I/B/E/T] (乾淨AC可空)") | str upcase
  let err2 = (ask "次因 (可空)") | str upcase
  let summary = (ask "費曼摘要 (≤3句)")
  let cue = (ask "線索卡: 下次遇到__就__")

  let row = {
    kind: "attempt"
    id: ($now | format date "%Y%m%d%H%M%S")
    date: ($now | format date "%Y-%m-%d")
    problem: $problem
    rating: (if ($rating_s | is-empty) { null } else { $rating_s | into int })
    topics: $topics
    mode: (if ($mode | is-empty) { "solve" } else { $mode })
    result: $result
    score: $score
    hint_level: $hint
    t_think: $t_think
    t_code: $t_code
    t_debug: $t_debug
    error_primary: (if ($err | is-empty) { null } else { $err })
    error_secondary: (if ($err2 | is-empty) { null } else { $err2 })
    summary: $summary
    cue: $cue
    needs_review: (($result != "ac") or ($hint > 0) or ($err in ["K" "P" "M"]))
  }
  append-line (attempts-file) $row
  print $"已記錄 ($row.id) ($problem)"
  $row
}

# 今日到期的複習（空白重推）
export def "forge due" [] {
  let all = (load)
  let today = (date now | format date "%Y-%m-%d")
  let reviews = ($all | where kind == "review")
  $all
  | where kind == "attempt" and $it.needs_review
  | each {|a|
      let ok = ($reviews | where ref == $a.id and $it.recalled)
      let stage = ($ok | length)
      if $stage >= 3 { null } else {
        let base = if ($ok | is-empty) { $a.date } else { $ok | last | get date }
        let due = (($base | into datetime) + (($INTERVALS | get $stage) * 1day) | format date "%Y-%m-%d")
        if $due <= $today {
          { id: $a.id, problem: $a.problem, stage: ($stage + 1), due: $due, cue: $a.cue }
        } else { null }
      }
    }
  | compact
}

# 記錄一次複習結果
export def "forge done" [id: string, --failed] {
  let hit = (load | where kind == "attempt" and id == $id)
  if ($hit | is-empty) { error make { msg: $"找不到 attempt ($id)" } }
  append-line (attempts-file) {
    kind: "review"
    ref: $id
    date: (date now | format date "%Y-%m-%d")
    recalled: (not $failed)
  }
  print (if $failed { "已記錄：重推失敗，明日再試" } else { "已記錄：重推成功" })
}

# 快速記錄一筆識別訓練
export def "forge rec" [
  problem: string
  topic: string
  guess: string
  --wrong (-w)
  --sec (-s): int = 0
] {
  append-line (rec-file) {
    date: (date now | format date "%Y-%m-%d")
    problem: $problem
    topic: $topic
    guess: $guess
    correct: (not $wrong)
    sec: $sec
  }
}

# 近況統計
export def "forge stats" [--days (-d): int = 30] {
  let cutoff = ((date now) - ($days * 1day) | format date "%Y-%m-%d")
  let a = (load | where kind == "attempt" and date >= $cutoff)
  if ($a | is-empty) { return "區間內沒有記錄" }

  let errs = ($a | where error_primary != null | group-by error_primary
    | transpose class n | update n { length } | sort-by n --reverse)

  let by_topic = ($a | where error_primary != null
    | flatten-topics | group-by topic
    | transpose topic n | update n { length } | sort-by n --reverse | first 8)

  {
    days: $days
    attempts: ($a | length)
    clean_ac_rate: (($a | where result == "ac" and hint_level == 0 | length) / ($a | length) * 100 | math round)
    partial_or_fail: ($a | where result in ["partial" "fail"] | length)
    median_think_min: ($a | get t_think | math median)
    median_total_min: ($a | each { $in.t_think + $in.t_code + $in.t_debug } | math median)
    error_dist: $errs
    weak_topics: $by_topic
  }
}

def flatten-topics [] {
  each {|r| $r.topics | each {|t| { topic: $t } } } | flatten
}
