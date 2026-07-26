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
forge add        # 互動式記錄一次解題
forge due        # 今日到期的複習題
forge stats      # 近況統計：解出率、錯誤分佈、時間分解
```

## 原則

- 日誌是地基：選題、診斷、複習全部從 `log/` 長出來
- 工具跟著訓練長，不預先蓋系統
- 所有資料 JSONL，nushell 直接可查
