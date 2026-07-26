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

# ===================== session 狀態機 + 提示閘道 =====================

def session-file [] { root | path join "log/session.json" }

def load-session [] {
  let sf = (session-file)
  if not ($sf | path exists) {
    error make { msg: "沒有進行中的 session，先 forge start" }
  }
  open $sf
}

def now-iso [] { date now | format date "%+" }

def mins-since [iso: string] {
  ((date now) - ($iso | into datetime)) / 1min | math floor
}

# 開始一次解題（進入思考階段，開始計時）
export def "forge start" [
  problem: string
  --rating (-r): int
  --topics (-t): string = ""
  --mode (-m): string = "solve"
  --stuck-min: int = 30   # 首個提示解鎖前的最短思考分鐘
] {
  let sf = (session-file)
  if ($sf | path exists) {
    error make { msg: $"已有進行中 session：(open $sf | get problem)。先 forge finish 或 forge abort" }
  }
  let now = (now-iso)
  {
    problem: $problem
    rating: $rating
    topics: ($topics | split row "," | each { str trim | str downcase } | where ($it | is-not-empty))
    mode: $mode
    stuck_min: $stuck_min
    started: $now
    phase: "think"
    events: [{ at: $now, kind: "start" }]
    hints: []
    denied: 0
  } | save $sf
  print $"開始 ($problem)。L1 提示 ($stuck_min) 分鐘後解鎖。進入實作時 forge code。"
}

# 目前 session 狀態與下一級提示倒數
export def "forge status" [] {
  let s = (load-session)
  let lvl = ($s.hints | length) + 1
  let next = if $lvl > 4 {
    "提示已用盡"
  } else {
    let since = if $lvl == 1 { mins-since $s.started } else { mins-since ($s.hints | last | get at) }
    let need = if $lvl == 1 { $s.stuck_min } else { 15 }
    if $since >= $need { $"L($lvl) 可解鎖" } else { $"L($lvl) 還需 ($need - $since) 分鐘" }
  }
  {
    problem: $s.problem
    phase: $s.phase
    elapsed_min: (mins-since $s.started)
    hints_used: ($s.hints | length)
    denied: $s.denied
    next_hint: $next
  }
}

def hint-rules [lvl: int] {
  match $lvl {
    1 => "只給『方向』：一句話指出這題屬於哪類建模或主題（例：圖論建模、答案具單調性可二分）。嚴禁給出關鍵觀察、引理、步驟、狀態定義或演算法組合。"
    2 => "只給『關鍵觀察』：這題最核心的一條性質或轉化，一到兩句。嚴禁給出完整解法步驟、狀態定義細節或實作方式。"
    3 => "只給『引理／核心步驟』：解法骨架（核心引理或狀態定義），不含實作細節、不含代碼。"
    _ => "給出完整題解。結尾必須加一行：『關掉此題解，從空白檔案重新實作。』"
  }
}

# 申請下一級提示（閘道：L1 需滿 stuck-min，之後每級間隔 15 分鐘）
export def "forge hint" [
  --notes (-n): string = ""   # 學生目前的思路/卡點，會附進提示詞
] {
  let sf = (session-file)
  let s = (load-session)
  let lvl = ($s.hints | length) + 1
  if $lvl > 4 { error make { msg: "四級提示已用盡——這題按 fail 收，finish 後從空白重做題解" } }

  let since = if $lvl == 1 { mins-since $s.started } else { mins-since ($s.hints | last | get at) }
  let need = if $lvl == 1 { $s.stuck_min } else { 15 }
  if $since < $need {
    $s
    | update denied { $in + 1 }
    | update events { append { at: (now-iso), kind: "hint_denied", level: $lvl } }
    | save -f $sf
    print $"閘道拒絕：L($lvl) 還需 ($need - $since) 分鐘。回去想。（此次申請已記錄）"
    return
  }

  let prompt = $"你是競程訓練的提示閘道，服務一名備戰 IOI 的學生。
題目：($s.problem)（若為題號/URL 請自行查閱題面；無法查閱就要求學生貼題面後再回答）
學生目前的思路：(if ($notes | is-empty) { '（未提供）' } else { $notes })

任務：給出第 ($lvl) 級提示。(hint-rules $lvl)
規則：用繁體中文，簡潔。嚴禁輸出高於本級的任何資訊。不得評論學生應該早點看題解。"

  let cmd = ($env.FORGE_LLM_CMD? | default "")
  if ($cmd | is-empty) {
    print "--- 未設定 FORGE_LLM_CMD，把以下提示詞貼給你的 LLM ---"
    print $prompt
  } else {
    $prompt | ^sh -c $cmd
  }

  let now = (now-iso)
  $s
  | update hints { append { level: $lvl, at: $now } }
  | update events { append { at: $now, kind: "hint", level: $lvl } }
  | save -f $sf
}

# 標記進入實作階段（自動記 t_think）
export def "forge code" [] {
  let sf = (session-file)
  let s = (load-session)
  $s
  | update phase { "code" }
  | update events { append { at: (now-iso), kind: "code" } }
  | save -f $sf
  print $"進入實作。思考用時 (mins-since $s.started) 分鐘。"
}

# 標記進入除錯階段（第一次提交失敗時打）
export def "forge debug" [] {
  let sf = (session-file)
  let s = (load-session)
  $s
  | update phase { "debug" }
  | update events { append { at: (now-iso), kind: "debug" } }
  | save -f $sf
}

# 結束 session，寫入日誌（時間自動計算）
export def "forge finish" [
  result: string   # ac / partial / fail（用過提示的 ac 自動轉 ac_hint）
  --score: int     # partial 時的分數
  --err: string        # 主因分類（非互動模式）
  --err2: string       # 次因（非互動模式）
  --summary (-s): string  # 費曼摘要（非互動模式）
  --cue (-c): string      # 線索卡（非互動模式）
] {
  let sf = (session-file)
  let s = (load-session)
  let now = (date now)
  let started = ($s.started | into datetime)
  let code_ev = ($s.events | where kind == "code")
  let debug_ev = ($s.events | where kind == "debug")

  let code_at = if ($code_ev | is-empty) { null } else { $code_ev | first | get at | into datetime }
  let debug_at = if ($debug_ev | is-empty) { null } else { $debug_ev | first | get at | into datetime }

  let t_think = if $code_at == null { ($now - $started) / 1min } else { ($code_at - $started) / 1min } | math round
  let t_code = if $code_at == null { 0 } else if $debug_at == null { ($now - $code_at) / 1min | math round } else { ($debug_at - $code_at) / 1min | math round }
  let t_debug = if $debug_at == null { 0 } else { ($now - $debug_at) / 1min | math round }

  let hint_level = if ($s.hints | is-empty) { 0 } else { $s.hints | get level | math max }
  let final_result = if $result == "ac" and $hint_level > 0 { "ac_hint" } else { $result }

  let err_v = (if $err == null { ask "主因分類 [R/K/P/M/I/B/E/T] (乾淨AC可空)" } else { $err }) | str upcase
  let err2_v = (if $err2 == null { ask "次因 (可空)" } else { $err2 }) | str upcase
  let summary_v = if $summary == null { ask "費曼摘要 (≤3句)" } else { $summary }
  let cue_v = if $cue == null { ask "線索卡: 下次遇到__就__" } else { $cue }

  let row = {
    kind: "attempt"
    id: ($now | format date "%Y%m%d%H%M%S")
    date: ($now | format date "%Y-%m-%d")
    problem: $s.problem
    rating: $s.rating
    topics: $s.topics
    mode: $s.mode
    result: $final_result
    score: $score
    hint_level: $hint_level
    t_think: $t_think
    t_code: $t_code
    t_debug: $t_debug
    error_primary: (if ($err_v | is-empty) { null } else { $err_v })
    error_secondary: (if ($err2_v | is-empty) { null } else { $err2_v })
    summary: $summary_v
    cue: $cue_v
    needs_review: (($final_result != "ac") or ($hint_level > 0) or ($err_v in ["K" "P" "M"]))
    hints: $s.hints
    hint_denied: $s.denied
  }
  append-line (attempts-file) $row
  rm $sf
  print $"已記錄 ($row.id) ($s.problem)：think ($t_think)m / code ($t_code)m / debug ($t_debug)m / hint L($hint_level) / 拒絕 ($s.denied) 次"
  $row
}

# 放棄目前 session（不寫日誌）
export def "forge abort" [] {
  let s = (load-session)
  rm (session-file)
  print $"已放棄 ($s.problem)（未寫入日誌）"
}
