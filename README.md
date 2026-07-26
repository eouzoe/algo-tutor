# ioi-forge

三年（2026.08 → 2029.08）IOI 金牌訓練系統。一名學生，完全客製化。

## 結構

```
docs/methodology.md      訓練迴路、提示階梯、分期里程碑
docs/error-taxonomy.md   錯誤分類法（日誌與診斷的地基）
docs/schema.md           日誌資料格式定義
log/attempts.jsonl       每題一筆的解題日誌
log/recognition.jsonl    識別訓練日誌
.nu/forge.nu             記錄與查詢工具（nushell）
```

## 用法

```nu
use .nu/forge.nu *

forge today      # 每日入口：複習→課綱→題單→識別訓練（just today）
forge learn      # 當前課綱單元上課（LLM 家教：會的複習、不會的從零教）
forge pass       # 檢核題全 AC 後推進單元（18 單元：零語法 → 初選考點）

# 解題 session（推薦，時間自動計、提示有閘道）
forge start cses/1621 -r 1100 -t sorting   # 開始計時
forge status     # 進度與下一級提示倒數
forge hint -n "卡在..."   # 申請提示（未到時限會拒絕並留痕）
forge code       # 進入實作
forge debug      # 首次提交失敗時打
forge finish ac  # 收尾：問錯誤分類/摘要/線索卡，寫日誌

forge add        # 手動補記一次解題（不經 session）
forge due        # 今日到期的複習題（空白重推）
forge done <id>  # 記錄複習結果（--failed 為失敗）
forge rec        # 記錄一筆識別訓練
forge stats      # 近況統計：解出率、錯誤分佈、弱點熱圖

forge sync                 # 同步 CF 題庫快取（~11k 題）
forge profile -r 1100      # 設定學生當前 rating
forge pick                 # 今日題單：rating+200~400、排除已做、弱點加權（tags 預設隱藏，--spoil 顯示）
forge pick -t dp -c 5 --lo 100 --hi 300   # 塊狀練習期鎖定主題

forge report --save        # 訓練週報 markdown → reports/
forge diagnose             # 週報 + 教練診斷 prompt → FORGE_LLM_CMD

forge gen "n 1..1e5，n 個整數 1..1e9"   # LLM 生成測資生成器 gen.cpp
forge stress sol.cpp brute.cpp          # 對拍到出反例（存 counterexample.txt）
```

所有命令也有 `just` 包裝：`just pick`、`just start cses/1621`、`just hint`、`just stress sol.cpp brute.cpp`…

題面來源（識別訓練用）：CF 主站有 Cloudflare，但洛谷鏡像（luogu.com.cn/problem/CF{id}）、CSES、AtCoder 均可直接抓取。

提示來源：設 `$env.FORGE_LLM_CMD`（如 `"codex exec -"`，從 stdin 讀提示詞）；
未設定時印出提示詞，手動貼給任何 LLM。閘道防不了繞過，防的是無痕繞過。

## 原則

- 日誌是地基：選題、診斷、複習全部從 `log/` 長出來
- 工具跟著訓練長，不預先蓋系統
- 所有資料 JSONL，nushell 直接可查
