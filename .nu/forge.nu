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
  print $"開始 ($problem)。L1 提示 ($stuck_min) 分鐘後解鎖（just hint）。進入實作時 just code。"
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
  if $lvl > 4 { error make { msg: "四級提示已用盡——這題按 fail 收（just finish fail），之後從空白重做題解" } }

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

# ===================== 選題引擎 =====================

def data-dir [] { root | path join "data" }

# 同步 Codeforces 題庫快取（含難度、tags、過題數）
export def "forge sync" [] {
  mkdir (data-dir)
  let resp = (http get "https://codeforces.com/api/problemset.problems")
  if $resp.status != "OK" { error make { msg: "CF API 回應異常" } }
  let probs = ($resp.result.problems | insert key {|p| $"($p.contestId)($p.index)" })
  let stats = ($resp.result.problemStatistics
    | insert key {|p| $"($p.contestId)($p.index)" }
    | select key solvedCount)
  let merged = ($probs | join $stats key | each {|p| {
    id: $"cf/($p.contestId)($p.index)"
    name: $p.name
    rating: ($p.rating? | default null)
    tags: $p.tags
    solved: $p.solvedCount
    url: $"https://codeforces.com/problemset/problem/($p.contestId)/($p.index)"
  }})
  $merged | save -f (data-dir | path join "cf-problems.json")
  print $"已同步 ($merged | length) 題（含 rating: ($merged | where rating != null | length)）"
}

# 讀/設學生檔案（目前只有 cf_rating）
export def "forge profile" [--rating (-r): int] {
  let pf = (data-dir | path join "profile.json")
  if $rating == null {
    if ($pf | path exists) { open $pf } else { {} }
  } else {
    mkdir (data-dir)
    let cur = if ($pf | path exists) { open $pf } else { {} }
    let updated = ($cur | upsert cf_rating $rating)
    $updated | save -f $pf
    $updated
  }
}

def weak-topics [] {
  let cutoff = ((date now) - 30day | format date "%Y-%m-%d")
  load
  | where kind == "attempt" and date >= $cutoff and error_primary != null
  | flatten-topics | group-by topic | transpose topic n
  | update n { length } | sort-by -r n | first 5 | get topic
}

# 出今日題單：rating+lo~hi、排除已做、弱點 tag 加權、經典度(過題數)次序
# tags 預設隱藏（劇透=免費 L1 提示）；--spoil 顯示（教練用/賽後複盤/塊狀期）
export def "forge pick" [
  --count (-c): int = 3
  --rating (-r): int     # 不給則讀 forge profile
  --topic (-t): string   # 鎖定單一 tag（塊狀練習期用）
  --lo: int = 200
  --hi: int = 400
  --spoil                # 顯示 tags 與弱點命中數
] {
  let f = (data-dir | path join "cf-problems.json")
  if not ($f | path exists) { error make { msg: "題庫快取不存在，先 just sync" } }
  let base = if $rating != null { $rating } else {
    let p = (forge profile)
    if ($p | is-empty) { error make { msg: "給 --rating 或先 just profile -r N" } }
    $p.cf_rating
  }
  let done = (load | where kind == "attempt" | get problem)
  let weak = (weak-topics)
  let pool = (open $f
    | where rating != null
    | where rating >= ($base + $lo) and rating <= ($base + $hi)
    | where {|p| $p.id not-in $done })
  let pool = if $topic == null { $pool } else { $pool | where {|p| $topic in $p.tags } }
  if ($pool | is-empty) { error make { msg: "沒有符合條件的題，放寬 --lo/--hi 或換 --topic" } }
  let picked = ($pool
    | insert weak_hits {|p| $p.tags | where $it in $weak | length }
    | sort-by -r weak_hits solved
    | first ([($count * 4) ($pool | length)] | math min)
    | shuffle
    | first $count)
  if $spoil {
    $picked | select id name rating tags weak_hits url
  } else {
    $picked | select id name rating url
  }
}

# ===================== 週報與診斷 =====================

def load-rec [] {
  let f = (rec-file)
  if ($f | path exists) {
    open --raw $f | lines | where ($it | str trim | is-not-empty) | each { $in | from json }
  } else { [] }
}

def err-dist [rows] {
  $rows | where error_primary != null | group-by error_primary
  | transpose class n | update n { length } | sort-by -r n
}

# 產出訓練週報（markdown）。--save 存入 reports/
export def "forge report" [
  --days (-d): int = 7
  --save
] {
  let now = (date now)
  let cutoff = ($now - ($days * 1day) | format date "%Y-%m-%d")
  let prev_cutoff = ($now - (($days * 2) * 1day) | format date "%Y-%m-%d")
  let all = (load)
  let a = ($all | where kind == "attempt" and date >= $cutoff)
  let prev = ($all | where kind == "attempt" and date >= $prev_cutoff and date < $cutoff)
  let reviews = ($all | where kind == "review" and date >= $cutoff)
  let recs = (load-rec | where date >= $cutoff)
  let profile = (forge profile)

  let clean_rate = {|rows|
    if ($rows | is-empty) { 0 } else {
      ($rows | where result == "ac" and hint_level == 0 | length) / ($rows | length) * 100 | math round
    }
  }

  let fails = ($a | where result in ["fail" "partial"] or hint_level > 2)
  let denied_total = ($a | each { $in.hint_denied? | default 0 } | math sum)
  let topic_err = ($a | where error_primary != null | flatten-topics
    | group-by topic | transpose topic n | update n { length } | sort-by -r n | first 8)

  let lines = [
    $"# 訓練週報 ($cutoff) → ($now | format date '%Y-%m-%d')"
    ""
    $"當前 rating 檔案：(if ($profile | is-empty) { '未設定' } else { $profile.cf_rating })"
    ""
    "## 量與質"
    $"- 解題數：($a | length)（前一期 ($prev | length)）"
    $"- 乾淨 AC 率：(do $clean_rate $a)%（前一期 (do $clean_rate $prev)%，目標帶 30–50%）"
    $"- 平均提示等級：(if ($a | is-empty) { 0 } else { $a | get hint_level | math avg | math round --precision 2 })"
    $"- 閘道拒絕次數：($denied_total)（提前要提示的衝動指標）"
    $"- 思考時間中位數：(if ($a | is-empty) { 0 } else { $a | get t_think | math median })m"
    ""
    "## 錯誤分佈（主因）"
    (err-dist $a | each {|r| $"- ($r.class)：($r.n)" } | str join "\n")
    ""
    "## 弱點主題（錯誤 × 主題）"
    ($topic_err | each {|r| $"- ($r.topic)：($r.n)" } | str join "\n")
    ""
    "## 失敗與重提示題（需覆盤）"
    ($fails | each {|r| $"- ($r.problem) [($r.rating)] ($r.result) hint L($r.hint_level) 主因 ($r.error_primary? | default '-')：($r.cue)" } | str join "\n")
    ""
    "## 複習"
    $"- 本期完成複習：($reviews | length)，成功率：(if ($reviews | is-empty) { '-' } else { $"(($reviews | where recalled | length) / ($reviews | length) * 100 | math round)%" })"
    $"- 目前積壓到期：(forge due | length) 題"
    ""
    "## 識別訓練"
    $"- 題數：($recs | length)，方向正確率：(if ($recs | is-empty) { '-' } else { $"(($recs | where correct | length) / ($recs | length) * 100 | math round)%" })"
  ]
  let md = ($lines | str join "\n")
  if $save {
    let dir = (root | path join "reports")
    mkdir $dir
    let f = ($dir | path join $"report-($now | format date '%Y-%m-%d').md")
    $md | save -f $f
    print $"已存 ($f)"
  }
  $md
}

# 週報 + 教練診斷 prompt → FORGE_LLM_CMD（未設定則印出）
export def "forge diagnose" [--days (-d): int = 7] {
  let md = (forge report --days $days)
  let prompt = $"你是 IOI 訓練教練。以下是學生本期訓練週報（資料由日誌自動統計，錯誤分類定義：R讀題/K知識缺口/P檢索失敗/M建模/I實作/B邊界/E效率/T時間分配）。

($md)

任務（用繁體中文，直接、具體，不客套）：
1. 診斷：本期最大的一個瓶頸是什麼？用數據佐證。
2. 檢查訓練健康度：乾淨 AC 率是否在 30–50% 目標帶？偏離的話，難度該怎麼調？
3. 開下週處方：主題配比（塊狀 vs 交錯）、每個弱點主題對應的矯正動作（對照錯誤分類的處方表）。
4. 紅旗：有沒有過度依賴提示、複習積壓、或錯誤分佈惡化的跡象？
輸出不超過 400 字。"
  let cmd = ($env.FORGE_LLM_CMD? | default "")
  if ($cmd | is-empty) {
    print "--- 未設定 FORGE_LLM_CMD，把以下貼給你的 LLM ---"
    $prompt
  } else {
    $prompt | ^sh -c $cmd
  }
}

# ===================== 對拍 =====================

# 用 LLM 從約束生成 C++ 測資生成器（argv[1]=seed，偏向小數據）
export def "forge gen" [
  constraints: string    # 例 "第一行 n (1..1e5)，第二行 n 個整數 (1..1e9)"
  --out (-o): string = "gen.cpp"
] {
  let prompt = $"寫一個 C++17 測資生成器，用於競程對拍。
輸入格式約束：($constraints)

要求：
- argv[1] 是隨機種子（mt19937 seed）
- 產生的測資偏向小規模（例如 n 多半取 1..8，偶爾取大），小數據更容易逼出反例且方便肉眼除錯
- 覆蓋邊界：最小值、相等元素、極值都要有機率出現
- 只輸出一組合法測資到 stdout
- 只輸出程式碼本身，不要 markdown 圍欄、不要解釋"
  let cmd = ($env.FORGE_LLM_CMD? | default "")
  if ($cmd | is-empty) {
    print "--- 未設定 FORGE_LLM_CMD，把以下貼給你的 LLM，回覆存成 gen.cpp ---"
    return $prompt
  }
  let code = ($prompt | ^sh -c $cmd | str replace -ra '```[a-z+]*' '' | str trim)
  $code | save -f $out
  print $"已寫入 ($out)，請人眼過一遍再用"
}

# 對拍：sol vs brute，跑到出反例或滿 runs 次
export def "forge stress" [
  sol: string            # 正解 .cpp
  brute: string          # 暴力 .cpp
  --gen (-g): string = "gen.cpp"
  --runs (-n): int = 300
] {
  for f in [$sol $brute $gen] {
    if not ($f | path exists) { error make { msg: $"找不到 ($f)" } }
  }
  print "編譯中..."
  ^g++ -O2 -std=c++17 -o /tmp/forge_sol $sol
  ^g++ -O2 -std=c++17 -o /tmp/forge_brute $brute
  ^g++ -O2 -std=c++17 -o /tmp/forge_gen $gen

  for i in 1..$runs {
    let inp = (^/tmp/forge_gen $i)
    let o1 = ($inp | ^/tmp/forge_sol | str trim)
    let o2 = ($inp | ^/tmp/forge_brute | str trim)
    if $o1 != $o2 {
      $inp | save -f counterexample.txt
      print $"反例！第 ($i) 次（已存 counterexample.txt）"
      print $"--- 輸入 ---\n($inp)"
      print $"--- 正解輸出 ---\n($o1)"
      print $"--- 暴力輸出 ---\n($o2)"
      return
    }
    if ($i mod 50) == 0 { print $"($i)/($runs) 通過" }
  }
  print $"($runs) 次全部一致，沒抓到反例"
}

# ===================== 課綱與每日入口 =====================

def curriculum [] { open (root | path join "data/curriculum.json") }

def save-profile [rec: record] {
  mkdir (data-dir)
  $rec | save -f (data-dir | path join "profile.json")
}

def solved-ids [] {
  load | where kind == "attempt" and result in ["ac" "ac_hint"] | get problem | uniq
}

def unit-remaining [u: record] {
  let done = (solved-ids)
  $u.problems | where $it not-in $done
}

# 當前單元的 LLM 家教課（會的快速複習、不會的從零教）
export def "forge learn" [
  --unit (-u): int
  --no-source     # 不抓 USACO Guide 教材（離線/省流量）
] {
  let prof = (forge profile)
  let cur = if $unit != null { $unit } else { $prof.unit? | default 1 }
  let c = (curriculum)
  if $cur > ($c | length) {
    print "課綱 18 單元已完成——之後以 just pick 純題目訓練為主"
    return
  }
  let ud = ($c | where id == $cur | first)
  print $"單元 ($ud.id)/($c | length)：($ud.name)"
  print $"目標：($ud.goals | str join '、')"
  if not ($ud.problems | is-empty) {
    print $"檢核題（AC 後 just pass）：($ud.problems | str join '、')，剩餘：(unit-remaining $ud | str join '、')"
  }

  let source = if $no_source or (($ud.usaco? | default []) | is-empty) { "" } else {
    let cache_dir = (data-dir | path join "usaco")
    mkdir $cache_dir
    let texts = ($ud.usaco | each {|path|
      let cache = ($cache_dir | path join ($path | str replace "/" "__"))
      if not ($cache | path exists) {
        try {
          http get $"https://raw.githubusercontent.com/cpinitiative/usaco-guide/master/content/($path)" | save -f $cache
        } catch { print $"（教材 ($path) 抓取失敗，略過）" }
      }
      if ($cache | path exists) { $"### 教材：($path)\n(open --raw $cache)" } else { "" }
    } | where ($it | is-not-empty))
    if ($texts | is-empty) { "" } else {
      $"\n\n以下是本課參考教材（USACO Guide 原文，英文 MDX）。以它的內容結構與例題為教學藍本，但全部用繁體中文重新講解，MDX 標記忽略即可：\n\n($texts | str join "\n\n")"
    }
  }

  let prompt = $"你是一對一 C++ 競程家教，學生目標是台灣 TOI 選訓營（APCS/能競/初選路線）。
本課單元：($ud.name)
教學目標：($ud.goals | str join '、')
教學重點：($ud.tutor)
檢核題：(if ($ud.problems | is-empty) { '無，以課內練習為準' } else { $ud.problems | str join '、' })

規則：
- 開場先用 2–3 個小問題探測學生已會的程度：會的快速複習帶過，不會的從零教起
- 費曼式推進：每講完一個概念，立即出一個 30 秒微練習，學生答對才前進
- 示例代碼用最小片段，要求學生自己動手打一遍；不要餵完整大段程式
- 收尾時指派檢核題，要求學生在終端打 just start <題號> 開始解題，不劇透解法
- 全程繁體中文；一次訊息只推進一小步，等學生回應($source)"
  let cmd = ($env.FORGE_LLM_CMD? | default "")
  if ($cmd | is-empty) {
    print "--- 未設定 FORGE_LLM_CMD，把以下貼給你的 LLM 開始上課 ---"
    $prompt
  } else {
    $prompt | ^sh -c $cmd
  }
}

# 通過當前單元，推進課綱（檢核題未全 AC 會擋）
export def "forge pass" [--force] {
  let prof = (forge profile)
  let cur = ($prof.unit? | default 1)
  let c = (curriculum)
  if $cur > ($c | length) { print "課綱已完成"; return }
  let ud = ($c | where id == $cur | first)
  let remaining = (unit-remaining $ud)
  if (not ($remaining | is-empty)) and (not $force) {
    error make { msg: $"檢核題未完成：($remaining | str join '、')。AC 後再 pass（或 --force）" }
  }
  save-profile ($prof | upsert unit ($cur + 1))
  let next = ($c | where id == ($cur + 1))
  if ($next | is-empty) {
    print $"單元 ($cur)〈($ud.name)〉通過——課綱全部完成！"
  } else {
    print $"單元 ($cur)〈($ud.name)〉通過 → 下一單元：($next.0.name)。開課：just learn"
  }
}

# 匯出線索卡：預設直推本機 Anki（AnkiConnect），--tsv 改存檔
export def "forge anki" [--tsv: string] {
  let cards = (load | where kind == "attempt")
    | where { ($in.cue? | default "" | str trim | is-not-empty) }
  if ($cards | is-empty) { print "還沒有線索卡（finish 時填的『下次遇到__就__』）"; return }

  if $tsv != null {
    $cards
    | each {|r| $"($r.problem)：這題的關鍵觸發線索與第一步是？\t($r.cue)<br>($r.summary)" }
    | str join "\n" | save -f $tsv
    print $"已匯出 ($cards | length) 張卡 → ($tsv)（Anki：檔案→匯入，Tab 分隔）"
    return
  }

  try {
    http post -t application/json http://127.0.0.1:8765 {action: "createDeck", version: 6, params: {deck: "ioi-forge"}} | ignore
    let notes = ($cards | each {|r| {
      deckName: "ioi-forge"
      modelName: "Basic"
      fields: {
        Front: $"($r.problem)：這題的關鍵觸發線索與第一步是？"
        Back: $"($r.cue)<br>($r.summary)"
      }
      options: { allowDuplicate: false }
      tags: ["ioi-forge" $r.id]
    }})
    let res = (http post -t application/json http://127.0.0.1:8765 {action: "addNotes", version: 6, params: {notes: $notes}})
    let added = ($res.result | where {|x| $x != null } | length)
    print $"已推送 ($added)/($cards | length) 張新卡到 Anki 牌組 ioi-forge（重複自動跳過）"
  } catch {
    print "連不到 Anki：請開著 Anki 並安裝 AnkiConnect 插件（插件代碼 2055492159）"
    print "或改用 just anki --tsv cards.tsv 匯出手動匯入"
  }
}

# 人類可讀的近期日誌
export def "forge log" [--limit (-l): int = 20] {
  let rows = (load | where kind == "attempt")
  if ($rows | is-empty) { print "還沒有解題記錄"; return }
  $rows | last $limit | reverse
  | each {|r| {
      date: $r.date
      problem: $r.problem
      result: $r.result
      hint: $r.hint_level
      "think/code/debug": $"($r.t_think)/($r.t_code)/($r.t_debug)m"
      err: ($r.error_primary? | default "")
      cue: $r.cue
    } }
}

# 每日入口：今天該做什麼（按進度漸進顯示，零基礎只看到上課）
export def "forge today" [] {
  let today = (date now | format date "%Y-%m-%d")
  let prof = (forge profile)
  let cur = ($prof.unit? | default 1)
  let c = (curriculum)
  let due = (forge due)
  let recs_today = (load-rec | where date == $today | length)
  let done_today = (load | where kind == "attempt" and date == $today)

  print $"=== ($today) ==="
  if (session-file | path exists) {
    print "▶ 進行中的題目："
    print (forge status | table)
  }

  if not ($due | is-empty) {
    print $"■ 到期複習 ($due | length) 題（空白重推，最優先）：just done <id> 記錄結果"
    print ($due | table)
  }

  if $cur <= ($c | length) {
    let ud = ($c | where id == $cur | first)
    let rem = (unit-remaining $ud)
    print $"■ 今日主線：單元 ($cur)/($c | length)〈($ud.name)〉 → 對 AI 家教說「上課」"
    if not ($rem | is-empty) { print $"  課後檢核題：($rem | str join '、')（AC 後推進單元）" }
  } else {
    print "■ 課綱已完成，今日題單："
    try { print (forge pick | table) } catch { print "  （先 just sync，再 just profile -r <rating>）" }
  }

  # 識別訓練從單元 10（已學過多個主題）才加入日課
  if $cur >= 10 { print $"■ 識別訓練：今日 ($recs_today)/10（just rec 記錄）" }
  if not ($done_today | is-empty) {
    print $"■ 今日已解：($done_today | length) 題（乾淨 AC ($done_today | where result == 'ac' and hint_level == 0 | length)）"
  }
}

# ===================== 自檢 =====================

# 環境與功能自檢（bootstrap 驗收也用它）
export def "forge doctor" [] {
  mut rows = []

  for t in [nu just g++ bun git] {
    $rows = ($rows | append { check: $"工具 ($t)", ok: (which $t | is-not-empty), required: true, fix: "devenv shell 內執行" })
  }
  $rows = ($rows | append { check: "工具 codex（學生 harness）", ok: (which codex | is-not-empty), required: false, fix: "bun install -g @openai/codex" })

  $rows = ($rows | append { check: "課綱 data/curriculum.json", ok: ((root | path join "data/curriculum.json") | path exists), required: true, fix: "repo 不完整，重新 clone" })
  $rows = ($rows | append { check: "CF 題庫快取", ok: ((data-dir | path join "cf-problems.json") | path exists), required: false, fix: "just sync" })
  $rows = ($rows | append { check: "mcp 依賴", ok: ((root | path join "mcp/node_modules") | path exists), required: true, fix: "cd mcp; bun install" })

  # 功能：編譯器真的能編
  "int main(){return 0;}" | save -f /tmp/forge_doctor.cpp
  let comp = (do { ^g++ -o /tmp/forge_doctor /tmp/forge_doctor.cpp } | complete)
  $rows = ($rows | append { check: "功能 g++ 編譯", ok: ($comp.exit_code == 0), required: true, fix: "檢查 gcc 安裝" })

  # 功能：提示閘道邏輯（隔離 FORGE_ROOT，不污染日誌）
  let forge_mod = (root | path join ".nu/forge.nu")
  let tmp = (mktemp -d)
  mkdir ($tmp | path join "log")
  let gate = (with-env { FORGE_ROOT: $tmp } {
    do { ^nu -c $"use '($forge_mod)' *; forge start doctor/test --stuck-min 30; forge hint" } | complete
  })
  rm -rf $tmp
  $rows = ($rows | append { check: "功能 提示閘道", ok: ($gate.stdout | str contains "閘道拒絕"), required: true, fix: "forge.nu 損壞，git checkout" })

  # 功能：MCP server 能啟動（送 initialize，5 秒後殺掉、驗已捕獲的回應）
  let mcp_ok = if ((root | path join "mcp/node_modules") | path exists) {
    let r = (do {
      '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"doctor","version":"0"}}}' + (char newline)
      | ^timeout 5 bun (root | path join "mcp/server.ts")
    } | complete)
    ($r.stdout | str contains '"name":"ioi-forge"')
  } else { false }
  $rows = ($rows | append { check: "功能 MCP server", ok: $mcp_ok, required: true, fix: "cd mcp; bun install 後重試" })

  $rows = ($rows | append { check: "AnkiConnect（選配）", ok: (try { http post -t application/json http://127.0.0.1:8765 {action: "version", version: 6} | get result | is-not-empty } catch { false }), required: false, fix: "開著 Anki + 插件 2055492159" })

  let bad = ($rows | where {|r| $r.required and (not $r.ok) })
  print ($rows | select check ok required fix | table)
  if ($bad | is-empty) {
    print "✔ 必要項全部通過"
  } else {
    print $"✘ ($bad | length) 個必要項未通過"
    error make { msg: "doctor 未通過" }
  }
}
